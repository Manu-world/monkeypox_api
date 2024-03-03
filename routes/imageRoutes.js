const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  upload,
  loadModelMiddleware,
  predictImage,
  getUserHistory,
  downloadUserHistoryPDF,
} = require("../controllers/imageController");

const router = express.Router();

router.post(
  "/predict",
  protect,
  loadModelMiddleware,
  upload.single("image"),
  predictImage
);
router.get("/history", protect, getUserHistory);
router.get("/history/pdf", protect, downloadUserHistoryPDF);

module.exports = router;
