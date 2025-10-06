const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(URI, {
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

module.exports = mongoose;
