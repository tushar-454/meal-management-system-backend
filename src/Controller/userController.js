const Meal = require('../Model/Meal');
const Money = require('../Model/Money');
const User = require('../Model/UserInfo');
const { getMealsByQuery } = require('../Services/userServices');

/* get all user 
   get user by email or accountStatus query
*/
const getUser = async (req, res, next) => {
  try {
    const { email, accountStatus } = req.query;
    let query = {};
    if (email) query.email = email;
    if (accountStatus) query.accountStatus = accountStatus;
    if (email && accountStatus) query = { email, accountStatus };
    const result = await User.find(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// add a userInfo when user first time create a account or login with google.
const addUser = async (req, res, next) => {
  try {
    const { name, email, role, accountStatus } = req.body;
    const userInfo = new User({ name, email, role, accountStatus });
    const result = await userInfo.save();
    res.status(201).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
};

/* get all meal or get 
   get meals using email or date qurey
   get meal using email and date query
   get current month current user total meal
*/
const getMeal = async (req, res, next) => {
  try {
    const { email, date } = req.query;
    const allMealData = await Meal.find().sort({ date: 1 });
    // get a single meal by email and date
    if (email && date) {
      const oneMealByEmailDate = await getMealsByQuery({ email, date });
      // get this user total meal
      const allMearForEmail = await Meal.find({ email });
      const totalMeal = await allMearForEmail.reduce((acc, cur) => {
        const getDate = new Date(cur.date);
        const curDate = new Date();
        if (
          getDate.getMonth() === curDate.getMonth() &&
          getDate.getFullYear() === curDate.getFullYear()
        ) {
          acc += cur.perDayTotal;
        }
        return acc;
      }, 0);

      return res.status(200).json({
        oneMealByEmailDate,
        totalMeal,
      });
    }
    // get all meal by user email
    if (email) {
      const allMealsByEmail = await getMealsByQuery({ email });

      return res.status(200).json(allMealsByEmail);
    }
    // get all meal by user date
    if (date) {
      const allMealsByDate = await getMealsByQuery({ date });
      return res.status(200).json(allMealsByDate);
    }

    res.status(200).json(allMealData);
  } catch (error) {
    next(error);
  }
};

/* */
const addMeal = async (req, res, next) => {};

/* 
  get all money by email
  get all money by month and year
*/
const getMoney = async (req, res, next) => {
  try {
    const { email } = req.query;
    const allMoneyByEmail = await Money.find({ email });
    const getCurMonthMoneyForEmail = allMoneyByEmail.filter((item) => {
      const curDate = new Date();
      const getDate = new Date(item.date);
      if (
        getDate.getMonth() === curDate.getMonth() &&
        getDate.getFullYear() === curDate.getFullYear()
      ) {
        return item;
      }
    });
    res.status(200).json(getCurMonthMoneyForEmail);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUser, addUser, getMeal, addMeal, getMoney };
