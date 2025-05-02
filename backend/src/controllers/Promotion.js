const models = require('../models/index');
const { Op } = require('sequelize');
const today = new Date();
const Promotion = {
    getApplicablePromotions: async (req, res) => {
        const orderTotal = parseFloat(req.query.order_total || 0);

        try {
            const promotions = await models.Promotion.findAll({
                where: {
                    is_active: true,
                    start_date: { [Op.lte]: today },
                    end_date: { [Op.gte]: today },
                    [Op.or]: [
                        { min_order_value: { [Op.lte]: orderTotal } },
                        { min_order_value: null }
                    ]
                },
                order: [['value', 'DESC']]
            });

            return res.json({ data: promotions });
        } catch (error) {
            console.error("Error fetching promotions:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
};

module.exports = Promotion;
