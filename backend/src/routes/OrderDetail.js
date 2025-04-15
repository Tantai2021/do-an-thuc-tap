const express = require('express');
const OrderDetailController = require("../controllers/OrderDetail");
const router = express.Router();
const Authenticate = require("../middleware/Authenticate");
const Authorize = require("../middleware/Authorize");

router.get("/:orderId", OrderDetailController.getOrderDetailByOrderId);

router.post("/", OrderDetailController.createOrderDetails);

module.exports = router;