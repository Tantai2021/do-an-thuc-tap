const express = require('express');
const OrderController = require("../controllers/Order");
const router = express.Router();
const Authenticate = require('../middleware/Authenticate');
const Authorize = require('../middleware/Authorize');

router.get("/", Authenticate, Authorize(['admin']), OrderController.getOrdersByStatus)
router.post("/", OrderController.createOrder);

module.exports = router;