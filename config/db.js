const mongoose = require("mongoose");
require("dotenv").config();

const dbUrl = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
