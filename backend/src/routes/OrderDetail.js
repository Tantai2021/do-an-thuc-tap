const express = require('express');
const OrderDetailController = require("../controllers/OrderDetail");
const router = express.Router();

router.post("/", OrderDetailController.createOrderDetails);

module.exports = router;