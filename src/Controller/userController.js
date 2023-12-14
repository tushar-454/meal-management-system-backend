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

module.exports = { getUser, addUser };
