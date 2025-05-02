const models = require('../models/index');
const { Op } = require('sequelize');

const OrderPromotion = {
    getOrderPromotionByOrderId: async (req, res) => {
        const { orderId } = req.params;
        try {
            const orderPromotion = await models.OrderPromotion.findAll({
                where: {
                    order_id: orderId
                },
            });
            return res.status(200).json({ data: orderPromotion });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = OrderPromotion;