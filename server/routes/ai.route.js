const express = require("express")
const router = express.Router();
const controller = require("../controller/ai.controller")

router.post("/ask-ai", controller.askAiController)

module.exports = router;