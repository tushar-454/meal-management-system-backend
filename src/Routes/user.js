const router = require('express').Router();
const Meal = require('../Model/Meal');
const userController = require('../Controller/userController');

router.get('/userInfo', userController.getUser);

router.post('/userInfo', userController.addUser);

router.get('/all-meal', userController.getMeal);
router.get('/all-money', userController.getMoney);
router.post('/add-meal', async (req, res) => {
  const { email, date, breackfast, launch, dinner, perDayTotal } = req.body;
  const isExists = await allMealCollection.findOne({
    email,
    date: new Date().toLocaleDateString(),
  });
  const isExistsNextMeal = await allMealCollection.findOne({
    email,
    date: `${new Date().getMonth() + 1}/${
      new Date().getDate() + 1
    }/${new Date().getFullYear()}`,
  });
  const newMealEntry = await allMealCollection.findOne({ email });
  if (isExists && new Date().getHours() < 20) {
    return res.send([
      {
        message:
          'Your todays meal already exists. Add your next meal between 08:00PM - 11:59PM',
      },
    ]);
  }
  if (isExistsNextMeal && new Date().getHours() > 19) {
    return res.send([{ message: 'Your next day meal already exists' }]);
  }
  if ((isExists && new Date().getHours() > 19) || !newMealEntry) {
    const mealInfo = {
      email,
      date,
      breackfast,
      launch,
      dinner,
      perDayTotal,
    };
    const result = await allMealCollection.insertOne(mealInfo);
    res.send(result);
  }
  if (!isExists) {
    return res.send([
      {
        message: "Can't find todays meal, first contact with manager or admin",
      },
    ]);
  }
});

router.get('/all-cost', async (req, res) => {
  const { email, date, type, monthYear } = req.query;
  if (email && !date && !type) {
    const result = await allCostCollection
      .find({ whoDoingBazarEmail: email })
      .toArray();
    return res.send(result);
  }
  if (!email && date && !type) {
    const result = await allCostCollection.find({ date }).toArray();
    return res.send(result);
  }
  if (!email && !date && type) {
    const result = await allCostCollection.find({ whatType: type }).toArray();
    return res.send(result);
  }
  if (!email && !date && !type && monthYear) {
    const allCosts = await allCostCollection.find().toArray();
    const monthlyCosts = [];
    allCosts.forEach((cost) => {
      const dateObj = new Date(cost.date);
      const date = `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
      if (date === monthYear) {
        monthlyCosts.push(cost);
      }
    });
    return res.send(monthlyCosts);
  }
  const result = await allCostCollection.find().toArray();
  res.send(result);
});

router.post('/add-money', async (req, res) => {
  const addMoneyInfo = req.body;
  try {
    const result = await allMoneyCollection.insertOne(addMoneyInfo);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

router.post('/add-cost', async (req, res) => {
  const costDoc = req.body;
  const result = await allCostCollection.insertOne(costDoc);
  res.send(result);
});

router.put('/update-meal', async (req, res) => {
  const { id, email } = req.query;
  const filter = { _id: new ObjectId(id) };
  const { breackfast, launch, dinner, perDayTotal } = req.body;
  if (new Date().getHours() > 7 && new Date().getHours() < 20) {
    return res.send([
      { message: "Timeout, Can't update breackfast or launch meal now." },
    ]);
  }
  if (new Date().getHours() > 16 && new Date().getHours() < 20) {
    return res.send([{ message: "Timeout, Can't update any meal now." }]);
  }
  // just update dinner info
  if (new Date().getHours() > 13 && new Date().getHours() < 17) {
    const updatedMealDoc = {
      $set: {
        dinner,
        perDayTotal,
      },
    };
    const result = await allMealCollection.updateOne(filter, updatedMealDoc);
    return res.send(result);
  }
  // update brackfast or launch or dinner info
  if (
    (new Date().getHours() > 19 && new Date().getHours() >= 23) ||
    new Date().getHours() < 8
  ) {
    const updatedMealDoc = {
      $set: {
        breackfast,
        launch,
        dinner,
        perDayTotal,
      },
    };
    const result = await allMealCollection.updateOne(filter, updatedMealDoc);
    return res.send([{ message: 'Update successfully' }]);
  }
});

module.exports = router;
