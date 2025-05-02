const express = require('express');
const router = express.Router();

const PromotionController = require('../controllers/Promotion');
const OrderPromotionController = require('../controllers/OrderPromotion');

router.get('/order/:orderId', OrderPromotionController.getOrderPromotionByOrderId);

module.exports = router;