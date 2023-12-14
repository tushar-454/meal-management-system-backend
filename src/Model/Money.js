const { model, Schema } = require('mongoose');

const moneySchema = new Schema({
  date: {
    type: String,
    require: true,
  },
  toWhome: {
    type: String,
    require: true,
  },
  money: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
});

const Money = model('AllMoney', moneySchema, 'allMoney');
module.exports = Money;
