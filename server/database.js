const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

// connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: { version: '1', strict: true}
    });
    console.log('Connected to MongoDB with Mongoose!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

connectDB();

// user functions

async function registerUser(username, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Username already exists');
		}
  }
}

async function validateLogin(username, password) {
  const user = await User.findOne({ username });
  if (!user) return false;

  return (await bcrypt.compare(password, user.password));
}

async function getUserCoins(username) {
  const user = await User.findOne({ username });
  if (!user) return null;

  return user.coins;
}

async function updateUserCoins(username, change) {
  const user = await User.findOne({ username });
  if (!user) return;

  user.coins += change;
  if (user.coins < 0) user.coins = 0;
  await user.save();
}

module.exports = {
  registerUser,
  validateLogin,
  getUserCoins,
  updateUserCoins,
};
