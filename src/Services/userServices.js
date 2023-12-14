const { query } = require('express');
const Meal = require('../Model/Meal');

const getMealsByQuery = async (query) => {
  const allMealsByQuery = await Meal.find(query);
  return allMealsByQuery;
};

module.exports = { getMealsByQuery };
