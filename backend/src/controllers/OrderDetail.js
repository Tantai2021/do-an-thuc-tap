const models = require('../models/index');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
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

            // 1. Tạo orderDetails
            const orderDetailsCreated = await models.OrderDetail.bulkCreate(orderDetails, { returning: true });

            // 2. Lấy ra IDs vừa tạo
            const ids = orderDetailsCreated.map(item => item.order_detail_id);

            // 3. Query lại với include
            const fullOrderDetails = await models.OrderDetail.findAll({
                where: {
                    order_detail_id: { [Op.in]: ids } // hoặc order_detail_id nếu model của bạn đặt như vậy
                },
                include: [
                    {
                        model: models.Order,
                        include: [
                            { model: models.Table } // Chỉ lấy tableNumber từ model Table
                        ]
                    },
                    { model: models.Food }
                ]
            });


            if (orderDetailsCreated) {
                req.io.emit("order-details-created", fullOrderDetails)
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
            return res.status(200).json({ data: orderDetails });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    updateOrderDetailStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        console.log(id);

        // Các trạng thái hợp lệ
        const validStatuses = ['pending', 'prepared', 'served', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        try {
            const orderDetail = await models.OrderDetail.findByPk(id, {
                include: [
                    { model: models.Food },
                    { model: models.Order, include: [{ model: models.Table }] } // Lấy thông tin bàn từ Order
                ]
            });

            if (!orderDetail) {
                return res.status(404).json({ error: 'Không tìm thấy món' });
            }

            await orderDetail.update({ status: status });

            req.io.emit('order-details-updated', orderDetail);
            return res.json({ message: 'Cập nhật trạng thái thành công', data: orderDetail });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }
    },

    getTodayChefOrders: async (req, res) => {
        try {
            const { status } = req.query;
            console.log(status);

            const timeZone = 'Asia/Ho_Chi_Minh';

            // Lấy ngày hiện tại theo múi giờ
            const today = moment().tz(timeZone);

            // Tính startOfDay và endOfDay dựa trên múi giờ
            const startOfDay = today.clone().startOf('day').toDate(); // 00:00:00
            const endOfDay = today.clone().endOf('day').toDate(); // 23:59:59

            const orders = await models.Order.findAll({
                where: {
                    start_time: {
                        [Op.between]: [startOfDay, endOfDay]
                    },
                    status: 'pending'
                },
                include: [
                    {
                        model: models.OrderDetail,
                        where: { status: status || 'pending' }, // Trạng thái mặc định là 'pending'
                        include: [{ model: models.Food }]
                    },
                    { model: models.Table, }
                ]
            });

            return res.status(200).json({ data: orders });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

};

module.exports = OrderDetail;
