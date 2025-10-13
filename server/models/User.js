const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 7
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
    coins: {
    type: Number,
    default: 200
  },
  Notes: {
    type: String,
    default: ""
  },
});

const User = mongoose.model('User', userSchema);

module.exports = { User };