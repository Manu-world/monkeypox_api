const nodemailer = require("nodemailer");
const {
  generateUserHistoryPDF,
  generateSinglePredictionPDF,
} = require("./pdfGenerator");
const stream = require("stream");

const sendEmail = async (
  user,
  predictions,
  recipientEmail,
  message,
  singlePrediction = null
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: recipientEmail,
    subject: singlePrediction
      ? "Your Prediction Result"
      : "Your Prediction History",
    text: message,
  };

  const pdfStream = new stream.PassThrough();

  pdfStream.on("finish", () => {
    emailOptions.attachments = [
      {
        filename: singlePrediction
          ? `${user.username}_result.pdf`
          : `${user.username}_prediction_history.pdf`,
        content: pdfStream.read(),
      },
    ];

    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
    });
  });

  if (singlePrediction) {
    generateSinglePredictionPDF(user, singlePrediction, pdfStream);
  } else {
    generateUserHistoryPDF(user, predictions, pdfStream);
  }

  pdfStream.end();
};

module.exports = { sendEmail };
