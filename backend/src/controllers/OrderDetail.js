const models = require('../models/index');
const { Op } = require('sequelize');

const OrderDetail = {
    createOrderDetails: async (req, res) => {
        try {
            const { orderDetails } = req.body;
            if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
                return res.status(400).json({ message: "Không tìm thấy danh sách order detail" });
            }

            const orderId = orderDetails[0].order_id;
            const order = await models.Order.findOne({ where: { id: orderId } });
            if (!order)
                return res.status(201).json({ message: "Không tìm thấy hóa đơn" });

            // Lấy tất cả food_id có trong orderDetails
            const foodIds = [...new Set(orderDetails.map(item => item.food_id))];
            const foods = await models.Food.findAll({
                where: { id: foodIds },
                attributes: ['id', 'name', 'price']
            });

            // Tạo bản đồ food_id -> food info
            const foodMap = {};
            foods.forEach(food => {
                foodMap[food.id] = food;
            });

            // Thêm thông tin món ăn vào từng orderDetail trước khi gửi socket
            const withFoodInfo = orderDetails.map(detail => ({
                ...detail,
                food: foodMap[detail.food_id] || null,
                status: 'Pending'
            }));

            const orderDetailsCreated = await models.OrderDetail.bulkCreate(orderDetails);

            if (orderDetailsCreated) {
                req.io.emit("order-details-created", withFoodInfo)
            }

            return res.status(201).json({ message: "Đã thực hiện" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    getOrderDetailByOrderId: async (req, res) => {
        try {
            const { orderId } = req.params;
            if (!orderId)
                return res.status(400).json({ message: "Không nhận được mã đơn hàng" });
            const order = await models.Order.findByPk(orderId);
            if (!order)
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            const orderDetails = await models.OrderDetail.findAll({
                where: { order_id: orderId },
                include: { model: models.Food, }
            });
            console.log(orderDetails)
            return res.status(200).json({ data: orderDetails });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    }

};

module.exports = OrderDetail;
