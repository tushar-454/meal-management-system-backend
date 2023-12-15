const router = require('express').Router();
const Meal = require('../Model/Meal');
const userController = require('../Controller/userController');

router.get('/userInfo', userController.getUser);

router.post('/userInfo', userController.addUser);

router.get('/all-meal', userController.getMeal);

router.post('/add-meal', userController.addMeal);

router.get('/all-money', userController.getMoney);

router.get('/all-cost', userController.getCost);

router.post('/add-cost', userController.addCost);

router.post('/add-money', userController.addMoney);

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
