const router = require('express').Router();

router.get('/userInfo', async (req, res) => {
  const { email, accountStatus } = req.query;
  let query = {};
  if (email) query.email = email;
  if (accountStatus) query.accountStatus = accountStatus;
  if (email && accountStatus) query = { email, accountStatus };
  const result = await userInfoCollection.find(query).toArray();
  res.send(result);
});

router.post('/userInfo', async (req, res) => {
  const userInfo = req.body;
  const result = await userInfoCollection.insertOne(userInfo);
  res.send(result);
});

router.get('/all-meal', async (req, res) => {
  const { email, date } = req.query;
  try {
    const allMealArr = await allMealCollection
      .find()
      .sort({
        date: 1,
      })
      .toArray();
    // get all meal by user uid
    if (email) {
      const uidAllMeal = allMealArr.filter(
        (singleMeal) => singleMeal.email === email
      );
      // get one meal by user uid and date
      if (date) {
        const uidOneMealByDate = uidAllMeal.filter(
          (singleMeal) =>
            new Date(singleMeal.date).toLocaleDateString() === date
        );
        return res.send(uidOneMealByDate);
      }
      return res.send(uidAllMeal);
    }
    res.send(allMealArr);
  } catch (error) {
    console.log(error.message);
  }
});

router.get('/all-money', async (req, res) => {
  const { email, date, month } = req.query;
  try {
    const allMoneyArr = await allMoneyCollection.find().toArray();
    // get all money info by user email
    if (email) {
      const emailAllMoney = await allMoneyCollection.find({ email }).toArray();
      // get one moneyinfo by user uid and date
      if (date) {
        const emailOneMoneyByDate = emailAllMoney.filter(
          // todo best way to query
          (singleMoney) =>
            new Date(singleMoney.date).toLocaleDateString() === date
        );
        return res.send(emailOneMoneyByDate);
      }
      // get user email all money and one month data
      if (month) {
        const monthlyAllMoney = emailAllMoney.filter((singleMoney) => {
          const singleMoneyDate = new Date(singleMoney.date);
          return (
            `${
              singleMoneyDate.getMonth() + 1
            }/${singleMoneyDate.getFullYear()}` === month
          );
        });
        return res.send(monthlyAllMoney);
        // todo
      }
      return res.send(emailAllMoney);
    }
    res.send(allMoneyArr);
  } catch (error) {
    console.log(error.message);
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
