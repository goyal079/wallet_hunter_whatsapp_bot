const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");

// Order matters! Put specific routes before parameter routes
router.get("/filter-options", memberController.getFilterOptions); // This must come first
router.get("/download", memberController.downloadMembers);
router.get("/", memberController.getMembers);
router.get("/:id", memberController.getMemberById);

module.exports = router;
