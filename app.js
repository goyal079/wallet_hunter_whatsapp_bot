const express = require("express");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Route to send WhatsApp message
app.post("/send-message", async (req, res) => {
  try {
    const { to, message } = req.body;

    // Format the 'to' number for WhatsApp
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    // Send message using Twilio
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      body: message,
    });

    res.json({
      success: true,
      messageId: response.sid,
      status: response.status,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Route to receive WhatsApp messages
app.post("/webhook", (req, res) => {
  const { Body, From } = req.body;

  console.log(`Received message from ${From}: ${Body}`);

  // Send automatic response
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message("Thank you for your message! We will get back to you soon.");

  res.type("text/xml").send(twiml.toString());
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
