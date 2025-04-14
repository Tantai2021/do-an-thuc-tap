const models = require('../models/index');
const { Op } = require('sequelize');

const OrderDetail = {
    createOrderDetails: async (req, res) => {
        try {
            const { orderDetails } = req.body;
            console.log(orderDetails)
            if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
                return res.status(400).json({ message: "Không tìm thấy danh sách order detail" });
            }

            const orderId = orderDetails[0].order_id;
            const order = await models.Order.findOne({ where: { id: orderId } });
            if (!order)
                return res.status(201).json({ message: "Không tìm thấy hóa đơn" });

            await models.OrderDetail.bulkCreate(orderDetails);

            return res.status(201).json({ message: "Tạo order details thành công" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    }

};

module.exports = OrderDetail;
