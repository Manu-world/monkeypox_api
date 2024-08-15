const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const errorMiddleware = require("./middlewares/errorMiddleware");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
require("dotenv").config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, process.env.STAGING_URL];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());
app.use(limiter);
app.use(compression());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/images", require("./routes/imageRoutes"));

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
