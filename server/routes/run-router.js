const express = require("express")
const router = express.Router();
const controller = require("../controller/run-controller")

router.post("/run", controller)

module.exports = router;