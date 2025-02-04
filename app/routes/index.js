const express = require("express");
const router = express.Router();

// Import other route files here
const whatsappRoutes = require("./whatsapp.routes");
const memberRoutes = require("./member.routes");

router.use("/whatsapp", whatsappRoutes);
router.use("/members", memberRoutes);

module.exports = router;
