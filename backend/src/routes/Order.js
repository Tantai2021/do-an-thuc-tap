const express = require('express');
const OrderController = require("../controllers/Order");
const router = express.Router();
const Authenticate = require('../middleware/Authenticate');
const Authorize = require('../middleware/Authorize');

router.get("/status/", Authenticate, Authorize(['admin']), OrderController.getOrdersByStatus);
router.get("/table", OrderController.getOrderByTable);
router.get("/search", Authenticate, Authorize(['admin']), OrderController.searchOrderByConditions);
router.get("/:orderId", Authenticate, Authorize(['admin', 'customer-service']), OrderController.getOrderById);
router.post("/", OrderController.createOrder);
router.delete('/:orderId', OrderController.deleteOrderById);

module.exports = router;