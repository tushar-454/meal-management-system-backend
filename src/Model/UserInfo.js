const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  role: {
    type: [String],
    require: true,
  },
  accountStatus: {
    type: String,
    require: true,
  },
});

const UserInfo = model('UserInfo', userSchema, 'userInfo');
module.exports = UserInfo;
