const Cost = require('../Model/Cost');
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

/* 
  user can add there meal breackfast,launch and dinner in a perticular time
*/
const addMeal = async (req, res, next) => {
  try {
    const { email, date, breackfast, launch, dinner, perDayTotal } = req.body;
    const curDate = new Date();
    const isExists = await Meal.findOne({
      email,
      date: curDate.toLocaleDateString(),
    });
    const isExistsNextMeal = await Meal.findOne({
      email,
      date: `${curDate.getMonth() + 1}/${
        curDate.getDate() + 1
      }/${curDate.getFullYear()}`,
    });
    // if user add first time then not find email so the condition for that user
    const newMealEntry = await Meal.findOne({ email });
    // now codition check for add meal
    if (isExists && curDate.getHours() < 20) {
      return res.status(403).json({
        message:
          'Your todays meal already exists. Add your next meal between 08:00PM - 11:59PM',
      });
    }
    if (isExistsNextMeal && curDate.getHours() > 19) {
      return res.status(403).json({
        message: 'Your next day meal already exists',
      });
    }
    if ((isExists && curDate.getHours() > 19) || !newMealEntry) {
      const createMeal = new Meal({
        email,
        date,
        breackfast,
        launch,
        dinner,
        perDayTotal,
      });
      const result = await createMeal.save();
      return res.status(201).json({ message: 'success' });
    }
    if (!isExists) {
      return res.status(404).json({
        message: "Can't find todays meal, first contact with manager or admin",
      });
    }
  } catch (error) {
    next(error);
  }
};

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

/*
  add monery in database from user
*/
const addMoney = async (req, res, next) => {
  try {
    const { date, toWhome, money, status, email } = req.body;
    const createMoney = new Money({ date, toWhome, money, status, email });
    const result = await createMoney.save();
    res.status(201).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
};

/*
  get current user all cost using email and get current month year all cost using query
*/
const getCost = async (req, res, next) => {
  try {
    const { email } = req.query;
    // get current user all cost in current month
    if (email) {
      const allCostEmailUser = await Cost.find({ whoDoingBazarEmail: email });
      const curMonthAllCost = allCostEmailUser.filter((item) => {
        const curDate = new Date();
        const getDate = new Date(item.date);
        if (
          getDate.getMonth() === curDate.getMonth() &&
          getDate.getFullYear() === curDate.getFullYear()
        ) {
          return item;
        }
      });
      return res.status(200).json(curMonthAllCost);
    }
    const allCost = await Cost.find();
    const curMonthAllCost = allCost.filter((item) => {
      const curDate = new Date();
      const getDate = new Date(item.date);
      if (
        getDate.getMonth() === curDate.getMonth() &&
        getDate.getFullYear() === curDate.getFullYear()
      ) {
        return item;
      }
    });
    res.status(200).json(curMonthAllCost);
  } catch (error) {
    next(error);
  }
};

/*
  add a cost in database 
*/
const addCost = async (req, res, next) => {
  try {
    const {
      date,
      whoDoingBazar,
      whoDoingBazarEmail,
      howCost,
      bazarListUrl,
      whatType,
    } = req.body;
    const createCost = new Cost({
      date,
      whoDoingBazar,
      whoDoingBazarEmail,
      howCost,
      bazarListUrl,
      whatType,
    });
    const result = await createCost.save();
    res.status(201).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
};

/*
  update user meal 
  here have lot of condition for update meal different time
*/
const updateMeal = async (req, res, next) => {
  try {
    const { breackfast, launch, dinner, perDayTotal } = req.body;
    const { id, email } = req.query;
    const curDate = new Date();
    // let's start update meal based on condition
    if (curDate.getHours() > 16 && curDate.getHours() < 20) {
      return res
        .status(408)
        .json({ message: "Timeout, Can't update any meal now." });
    }
    const meal = await Meal.findOne({ _id: new Object(id) });
    // update just dinner meal whole day to noon
    if (curDate.getHours() > 0 && curDate.getHours() < 17) {
      // update brackfast or launch or dinner info
      if (
        (curDate.getHours() > 19 && curDate.getHours() >= 23) ||
        curDate.getHours() < 8
      ) {
        meal.breackfast = breackfast ?? meal.breackfast;
        meal.launch = launch ?? meal.launch;
        meal.dinner = dinner ?? meal.dinner;
        meal.perDayTotal = perDayTotal ?? meal.perDayTotal;
        await meal.save();
        return res.status(201).json({ message: 'all success' });
      }
      // --------
      meal.dinner = dinner ?? meal.dinner;
      meal.perDayTotal = perDayTotal ?? meal.perDayTotal;
      await meal.save();
      return res.status(201).json({ message: 'dinner success' });
    }
    // update brackfast or launch or dinner info
    // i will do update today but meal next day
    if (curDate.getHours() > 19 && curDate.getHours() >= 23) {
      // we need to find next day meal
      meal.breackfast = breackfast ?? meal.breackfast;
      meal.launch = launch ?? meal.launch;
      meal.dinner = dinner ?? meal.dinner;
      meal.perDayTotal = perDayTotal ?? meal.perDayTotal;
      await meal.save();
      return res.status(201).json({ message: 'next day success' });
    }
    if (curDate.getHours() > 7 && curDate.getHours() < 20) {
      return res.status(408).json({
        message: "Timeout, Can't update breackfast or launch meal now.",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
  addUser,
  getMeal,
  addMeal,
  getMoney,
  addMoney,
  getCost,
  addCost,
  updateMeal,
};
