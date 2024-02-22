const User = require("../models/userModel");
const multer = require("multer");
const tf = require("@tensorflow/tfjs-node");
const path = require("path");
const fs = require("fs");
const {
  generateUserHistoryPDF,
  generateSinglePredictionPDF,
} = require("../utils/pdfGenerator");
const { sendEmail } = require("../utils/emailService");

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Load the model
let model;
const labels = ["Negative", "Positive"];

async function loadModel() {
  const modelPath = path.join(__dirname, "../best_epoch");
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model directory not found at ${modelPath}`);
  }
  model = await tf.node.loadSavedModel(modelPath);
  console.log("Model loaded successfully");
}

// Middleware to load the model before handling requests
const loadModelMiddleware = async (req, res, next) => {
  if (!model) {
    try {
      await loadModel();
    } catch (error) {
      console.error("Error loading model:", error);
      return res.status(500).json({ error: "Failed to load model" });
    }
  }
  next();
};

// Prediction endpoint
const predictImage = async (req, res) => {
  try {
    const filePath = req.file.path;

    // Read the image file
    const imageBuffer = fs.readFileSync(filePath);
    let imageTensor = tf.node.decodeImage(imageBuffer, 3);
    imageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
    imageTensor = imageTensor.expandDims(0); // Add batch dimension

    // Make prediction
    const prediction = model.predict(imageTensor).arraySync()[0];
    const classIndex = prediction.indexOf(Math.max(...prediction));
    const result = {
      label: labels[classIndex],
      confidence: prediction[classIndex] * 100,
    };

    // Save the prediction to the user's history
    const user = await User.findById(req.user.id);
    user.history.push({
      image: { buffer: imageBuffer, contentType: req.file.mimetype },
      prediction: result,
      date: new Date(),
    });
    await user.save();

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to make a prediction" });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.history || user.history.length === 0) {
      return res.json([]); // Return an empty array if no history exists
    }

    const history = user.history
      .map((prediction) => ({
        ...prediction._doc, // Ensure we're sending a clean object
        image: {
          buffer: prediction.image.buffer.toString("base64"), // Convert buffer to base64 string
          contentType: prediction.image.contentType || "image/jpeg", // Default to JPEG if contentType is undefined
        },
      }))
      .reverse(); // Reverse the history list

    console.log(history);

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error retrieving user history:", error);
    res.status(500).json({ error: "Failed to retrieve user history" });
  }
};

const downloadUserHistoryPDF = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const predictions = user.history;
    generateUserHistoryPDF(user, predictions, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

module.exports = {
  upload,
  loadModelMiddleware,
  predictImage,
  getUserHistory,
  downloadUserHistoryPDF,
};
