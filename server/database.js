const mongoose = require('mongoose');
const { User } = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();
mongoose.set('sanitizeProjection', true);

if (!process.env.MONGODB_URI) throw new Error("MongoDB Atlas URI not set");

// connect to MongoDB atlas
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: { version: '1', strict: true}
    });
    console.log('Connected to MongoDB with Mongoose!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

connectDB();


// functions

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

async function getUserTokens(username) {
  const user = await User.findOne({ username });
  if (!user) return null;

  return user.tokens;
}

async function updateUserTokens(username, change) {
  const user = await User.findOne({ username });
  if (!user) return null;

  user.tokens = Math.max(0, user.tokens + change);
  await user.save();
  return user.tokens;
}

async function getUserData(username) {
  const user = await User.findOne({ username });
  if (!user) return null;

  let data = { username: user.username, tokens: user.tokens, notes: user.Notes, transcript: user.Transcript };
  return data;
}

async function setUserNotes(username, notes) {
  const user = await User.findOne({ username });
  if (!user) return null;

  user.Notes = notes;
  await user.save();
  return true;
}

async function setUserTranscript(username, transcript) {
  const user = await User.findOne({ username });
  if (!user) return null;

  user.Transcript = transcript;
  await user.save();
  return true;
}

module.exports = {
  registerUser,
  validateLogin,
  getUserTokens,
  updateUserTokens,
  setUserNotes,
  getUserData,
  setUserTranscript,
};
