const { handleMessage } = require("../services/conversation.service");
const { MessagingResponse } = require("twilio").twiml;

async function handleIncomingMessage(req, res) {
  try {
    console.log("handleIncomingMessage", req.body);
    const { From, Body } = req.body;
    const response = await handleMessage(From, Body);

    const twiml = new MessagingResponse();
    twiml.message(response);

    res.set("Content-Type", "text/xml");
    return res.send(twiml.toString());
  } catch (error) {
    console.error("Error in handleIncomingMessage:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  handleIncomingMessage,
};

async function sendMessage(req, res) {
  try {
    // Implementation coming soon
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
