const express = require("express");
const multer = require("multer");
const tf = require("@tensorflow/tfjs-node");
const path = require("path");
const fs = require("fs");

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Load the model
let model;
const labels = ["Negative", "Positive"];

async function loadModel() {
  const modelPath = path.join(__dirname, "best_epoch");
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model directory not found at ${modelPath}`);
  }
  model = await tf.node.loadSavedModel(modelPath);
  console.log("Model loaded successfully");
}

// Middleware to load the model before handling requests
app.use(async (req, res, next) => {
  if (!model) {
    try {
      await loadModel();
    } catch (error) {
      console.error("Error loading model:", error);
      res.status(500).json({ error: "Failed to load model" });
      return;
    }
  }
  next();
});

// Prediction endpoint
app.post("/predict", upload.single("image"), async (req, res) => {
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

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to make a prediction" });
  }
});
