const Meal = require('../Model/Meal');
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
*/
const getMeal = async (req, res, next) => {
  try {
    const { email, date } = req.query;
    const allMealData = await Meal.find().sort({ date: 1 });
    // get a single meal by email and date
    if (email && date) {
      const oneMealByEmailDate = await getMealsByQuery({ email, date });
      // const totalMeal = (await Meal.find({ email })).reduce(
      //   (acc, cur) => cur.perDayTotal + acc,
      //   0
      // );
      const oneUserTotalMeal = await Meal.aggregate([
        {
          $match: { email: email },
        },
        {
          $group: {
            _id: null,
            totalPerDayTotal: { $sum: '$perDayTotal' },
          },
        },
      ]);

      return res.status(200).json({
        oneMealByEmailDate,
        totalMeal: oneUserTotalMeal[0].totalPerDayTotal,
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

module.exports = { getUser, addUser, getMeal };
