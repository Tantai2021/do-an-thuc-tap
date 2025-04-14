const express = require('express');
const AreaController = require("../controllers/Area");
const router = express.Router();

router.get("/", AreaController.getAreas);

module.exports = router;