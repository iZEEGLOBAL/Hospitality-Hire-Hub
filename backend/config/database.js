const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    console.log('Server will start without database connection');
    // Don't exit - let the server start anyway
  }
};

module.exports = connectDB;
