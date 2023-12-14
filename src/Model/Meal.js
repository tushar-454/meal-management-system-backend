const { model, Schema } = require('mongoose');

const mealSchema = new Schema({
  email: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    require: true,
  },
  breackfast: {
    type: Number,
    require: true,
  },
  launch: {
    type: Number,
    require: true,
  },
  dinner: {
    type: Number,
    require: true,
  },
  perDayTotal: {
    type: Number,
    require: true,
  },
});

const Meal = model('AllMeal', mealSchema, 'allMeal');
module.exports = Meal;
