const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contractController");

router.post("/generate", contractController.generateContract);

module.exports = router;
