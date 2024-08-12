const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const errorMiddleware = require("./middlewares/errorMiddleware");
const cors = require("cors");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/images", require("./routes/imageRoutes"));

// Error handling middleware
app.use(errorMiddleware);

// Export the app for use in the www file
module.exports = app;
