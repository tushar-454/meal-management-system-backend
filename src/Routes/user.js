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

router.put('/update-meal', userController.updateMeal);

module.exports = router;
