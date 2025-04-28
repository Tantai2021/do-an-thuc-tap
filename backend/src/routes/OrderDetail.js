const express = require('express');
const OrderDetailController = require("../controllers/OrderDetail");
const router = express.Router();
const Authenticate = require("../middleware/Authenticate");
const Authorize = require("../middleware/Authorize");

router.get("/:orderId", OrderDetailController.getOrderDetailByOrderId);

router.post("/", OrderDetailController.createOrderDetails);

router.patch('/:id/status', Authenticate, Authorize(['admin', 'chef']), OrderDetailController.updateOrderDetailStatus);

// Route chef
// Lấy danh sách món cần chế biến trong ngày (cho bếp)
router.get("/chef/today", Authenticate, Authorize(['chef', 'admin']), OrderDetailController.getTodayChefOrders);


module.exports = router;