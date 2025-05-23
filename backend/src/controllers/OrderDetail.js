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

            const servedItem = await models.OrderDetail.findAll({
                where: {
                    order_id: orderDetail.order_id,
                    status: 'served'
                }
            })
            const reCalculatedTotal = servedItem.reduce((total, item) => {
                return total + parseFloat(item.sub_total);
            }, 0);

            const promotion = await models.Promotion.findAll({
                where: {
                    is_active: true,
                    start_date: {
                        [Op.lte]: new Date()
                    },
                    end_date: {
                        [Op.gte]: new Date()
                    },
                    auto_apply: true,
                },

            });
            if (promotion.length > 0) {
                const promotionDiscount = promotion[0].value;
                const promotionType = promotion[0].type;
                let discount_amount = 0;
                if (promotionType === 'percent_discount') {
                    discount_amount = reCalculatedTotal * promotionDiscount / 100;
                } else if (promotionType === 'fixed') {
                    discount_amount = promotionDiscount;
                }
                const orderPromoted = await models.OrderPromotion.findOne({
                    where: {
                        order_id: orderDetail.order_id,
                        promotion_id: promotion[0].id
                    }
                });
                if (!orderPromoted) {
                    await models.OrderPromotion.create({
                        order_id: orderDetail.order_id,
                        promotion_id: promotion[0].id,
                        discount_amount: discount_amount
                    });
                }

            }

            // Cập nhật lại tổng tiền cho đơn hàng
            const order = await models.Order.findByPk(orderDetail.order_id);
            await order.update({ total_price: reCalculatedTotal });

            req.io.emit('order-details-updated', orderDetail);
            return res.json({ message: 'Cập nhật trạng thái thành công', data: orderDetail });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Lỗi máy chủ' });
        }
    },
    updateOrderDetailsStatus: async (req, res) => {
        const { ids, status } = req.body;  // ids là mảng ID các OrderDetail
        const validStatuses = ['pending', 'prepared', 'served', 'cancelled'];

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Danh sách món cần cập nhật không hợp lệ' });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        try {
            const orderDetails = await models.OrderDetail.findAll({
                where: { order_detail_id: { [Op.in]: ids } },
                include: [
                    { model: models.Food },
                    { model: models.Order, include: [{ model: models.Table }] }
                ]
            });

            if (orderDetails.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy các món cần cập nhật' });
            }
            // Cập nhật từng OrderDetail
            const updatePromises = orderDetails.map(orderDetail =>
                orderDetail.update({ status: status })
            );

            await Promise.all(updatePromises);

            // Tính lại tổng tiền cho đơn hàng
            const orderId = orderDetails[0].order_id; // Giả sử tất cả các OrderDetail đều thuộc cùng một đơn hàng
            const servedItems = await models.OrderDetail.findAll({
                where: {
                    order_id: orderId,
                    status: 'served'
                }
            });
            const reCalculatedTotal = servedItems.reduce((total, item) => {
                return total + parseFloat(item.sub_total);;
            }, 0);

            const promotion = await models.Promotion.findAll({
                where: {
                    is_active: true,
                    start_date: {
                        [Op.lte]: new Date()
                    },
                    end_date: {
                        [Op.gte]: new Date()
                    },
                    auto_apply: true,
                },

            });
            if (promotion.length > 0) {
                const promotionDiscount = promotion[0].value;
                const promotionType = promotion[0].type;
                let discount_amount = 0;
                if (promotionType === 'percent_discount') {
                    discount_amount = reCalculatedTotal * (promotionDiscount / 100);
                } else if (promotionType === 'fixed') {
                    discount_amount = promotionDiscount;
                }
                const orderPromoted = await models.OrderPromotion.findOne({
                    where: {
                        order_id: orderDetails[0].order_id,
                        promotion_id: promotion[0].id
                    }
                });
                if (!orderPromoted) {
                    await models.OrderPromotion.create({
                        order_id: orderDetails[0].order_id,
                        promotion_id: promotion[0].id,
                        discount_amount: discount_amount
                    });
                } else {
                    await orderPromoted.update({
                        discount_amount: discount_amount
                    });
                }

            }

            // Cập nhật lại tổng tiền cho đơn hàng
            const order = await models.Order.findByPk(orderId);
            await order.update({ total_price: reCalculatedTotal });

            // Gửi socket thông báo cập nhật nhiều món
            req.io.emit('order-details-updated-multiple', orderDetails);

            return res.json({
                message: 'Cập nhật trạng thái thành công cho nhiều món',
                data: orderDetails
            });
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
