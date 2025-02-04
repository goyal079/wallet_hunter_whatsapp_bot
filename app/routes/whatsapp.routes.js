const express = require("express");
const router = express.Router();
const { handleIncomingMessage } = require("../controllers/whatsapp.controller");

// Make sure the handler exists before adding the route
router.post("/webhook", handleIncomingMessage);
// router.post("/send-message", WhatsAppController.sendMessage);

module.exports = router;
