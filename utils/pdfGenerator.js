const PDFDocument = require("pdfkit");

const generateUserHistoryPDF = (user, predictions, outputStream) => {
  const doc = new PDFDocument({ margin: 30 });

  doc.pipe(outputStream);

  // Header
  doc
    .rect(0, 0, doc.page.width, 80)
    .fill("#0000FF")
    .fontSize(30)
    .fill("#FFFFFF")
    .text("PREDICTION HISTORY", 30, 20, {
      align: "center",
      width: doc.page.width - 60,
    });

  // User details
  doc
    .fill("#000000")
    .fontSize(12)
    .text(
      `Name: ${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`,
      30,
      100
    )
    .text(`Email: ${user.email}`)
    .text(`Date: ${new Date().toLocaleDateString()}`)
    .moveDown(4);

  const cardWidth = (doc.page.width - 60) / 3 - 10;
  let xPos = 30;
  let yPos = doc.y;

  // Predictions
  predictions.forEach((prediction, index) => {
    const borderColor =
      prediction.prediction.label === "Positive" ? "#FF0000" : "#008000";
    const textColor =
      prediction.prediction.label === "Positive" ? "#FF0000" : "#008000";

    if (index > 0 && index % 3 === 0) {
      xPos = 30;
      yPos += 280; // Move down for the next row
    }

    doc.rect(xPos, yPos, cardWidth, 250).stroke(borderColor).moveDown();

    if (prediction.image && prediction.image.buffer) {
      doc.image(prediction.image.buffer, xPos + 10, yPos + 10, {
        fit: [cardWidth - 20, 120],
      });
    }

    const predictionTextY = yPos + 140;
    doc
      .fontSize(10)
      .fill(textColor)
      .text(
        `${prediction.prediction.label.toUpperCase()}`,
        xPos + 10,
        predictionTextY,
        {
          align: "center",
          width: cardWidth - 20,
        }
      )
      .fontSize(8)
      .fill("#000000")
      .text(
        `Confidence: ${prediction.prediction.confidence.toFixed(2)}%`,
        xPos + 10,
        predictionTextY + 20
      )
      .text(
        `Date: ${new Date(prediction.date).toLocaleDateString()}`,
        xPos + 10,
        predictionTextY + 40
      );

    xPos += cardWidth + 10;
  });

  doc.end();
};

const generateSinglePredictionPDF = (user, prediction, outputStream) => {
  const doc = new PDFDocument({ margin: 30 });

  doc.pipe(outputStream);

  // Header
  doc
    .rect(0, 0, doc.page.width, 80)
    .fill("#0000FF")
    .fontSize(30)
    .fill("#FFFFFF")
    .text("PREDICTION RESULT", 30, 20, {
      align: "center",
      width: doc.page.width - 60,
    });

  // User details
  doc
    .fill("#000000")
    .fontSize(12)
    .text(
      `Name: ${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`,
      30,
      100
    )
    .text(`Email: ${user.email}`)
    .text(`Date: ${new Date().toLocaleDateString()}`)
    .moveDown(4);

  // Prediction card
  const borderColor =
    prediction.prediction.label === "Positive" ? "#FF0000" : "#008000";
  const textColor =
    prediction.prediction.label === "Positive" ? "#FF0000" : "#008000";

  doc
    .rect(30, doc.y, doc.page.width - 60, 250)
    .stroke(borderColor)
    .moveDown();

  if (prediction.image && prediction.image.buffer) {
    doc.image(prediction.image.buffer, 40, doc.y, { fit: [120, 120] });
  }

  const predictionTextY = doc.y + 130;
  doc
    .fontSize(10)
    .fill(textColor)
    .text(`${prediction.prediction.label.toUpperCase()}`, 40, predictionTextY, {
      align: "center",
      width: doc.page.width - 80,
    })
    .moveDown()
    .fontSize(8)
    .fill("#000000")
    .text(
      `Confidence: ${prediction.prediction.confidence.toFixed(2)}%`,
      40,
      predictionTextY + 20
    )
    .text(
      `Date: ${new Date(prediction.date).toLocaleDateString()}`,
      40,
      predictionTextY + 40
    )
    .moveDown(8);

  doc.end();
};

module.exports = { generateUserHistoryPDF, generateSinglePredictionPDF };
