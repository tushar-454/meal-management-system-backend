const { model, Schema } = require('mongoose');

const costSchema = new Schema({
  whoDoingBazar: {
    type: String,
    require: true,
  },
  whoDoingBazarEmail: {
    type: String,
    require: true,
  },
  howCost: {
    type: Number,
    require: true,
  },
  bazarListUrl: {
    type: String,
    require: true,
  },
  whatType: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    require: true,
  },
});

const Cost = model('AllCost', costSchema, 'allCost');

module.exports = Cost;
