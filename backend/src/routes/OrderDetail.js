const express = require('express');
const OrderDetailController = require("../controllers/OrderDetail");
const router = express.Router();
const Authenticate = require("../middleware/Authenticate");
const Authorize = require("../middleware/Authorize");

router.get("/:orderId", OrderDetailController.getOrderDetailByOrderId);

router.post("/", OrderDetailController.createOrderDetails);

router.patch('/:id/status', Authenticate, Authorize(['admin']), OrderDetailController.updateOrderDetailStatus);
module.exports = router;