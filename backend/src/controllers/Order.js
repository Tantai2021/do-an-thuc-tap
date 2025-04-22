const models = require('../models/index');
const { Op } = require('sequelize');

const Order = {
    getOrdersByStatus: async (req, res) => {
        try {
            const { status } = req.query;
            const orders = await models.Order.findAll({
                where: { status: status },
                include: [
                    { model: models.Table },
                    { model: models.Staff },
                    { model: models.Customer },
                ]
            });
            console.log("ORDERS: ", orders);
            return res.status(200).json({ data: orders })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    getOrderByTable: async (req, res) => {
        try {
            const { tableId, orderStatus } = req.query;

            const order = await models.Order.findOne({ where: { table_id: tableId, status: orderStatus } });
            return res.status(200).json({ data: order ?? null });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server', error });
        }
    },
    getOrderById: async (req, res) => {
        try {
            const { orderId } = req.params;

            if (!orderId)
                return res.status(400).json({ message: "Vui lòng cung cấp mã đơn hàng" });
            const order = await models.Order.findOne({
                where: { id: orderId },
                include: [
                    { model: models.Customer },
                    { model: models.Staff },
                    { model: models.Table },
                ]
            })

            return res.status(200).json({ data: order })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    createOrder: async (req, res) => {
        try {
            const { table_id, number_of_guests, customer_phone, customer_name, staff_id } = req.body;
            if (!table_id || !staff_id || !number_of_guests || !customer_phone || !customer_name)
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
            const customer = await models.Customer.findOne({ where: { phone: customer_phone } })
            let createdCustomer = null;
            if (!customer) {
                createdCustomer = await models.Customer.create({
                    name: customer_name,
                    phone: customer_phone
                });
            }
            const createdOrder = await models.Order.create({
                customer_id: customer?.id ?? createdCustomer?.id,
                staff_id: staff_id,
                table_id: table_id,
                number_of_guests: number_of_guests,
            })
            if (createdOrder) {
                await models.Table.update({ status: 'Occupied' }, { where: { id: table_id } });
                const newOrder = await models.Order.findOne({
                    where: { id: createdOrder.id },
                    include: [
                        { model: models.Customer },
                        { model: models.Staff },
                        { model: models.Table },
                    ]
                })
                req.io.emit("order-created", newOrder);
            }

            return res.status(200).json({ message: "Tạo đơn hàng thành công", data: createdOrder });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    deleteOrderById: async (req, res) => {
        try {
            const { orderId } = req.params;
            if (!orderId)
                return res.status(400).json({ message: "Vui lòng cung cấp mã đơn hàng" });
            const order = await models.Order.findByPk(orderId, {
                include: [
                    { model: models.Customer },
                    { model: models.Table },
                    { model: models.Staff },
                ]
            });
            if (!order)
                return res.status(404).json({ message: "Không tìm thấy đơn hàng " });

            const orderDetail = await models.OrderDetail.findAll({ where: { order_id: order.id } })
            if (orderDetail.length > 0)
                return res.status(401).json({ message: "Chi tiết đơn hàng đã được tạo, liên hệ admin để hủy đơn" });

            await order.update({ status: "cancelled" });
            await models.Table.update({ status: 'Available' }, { where: { id: order.table_id } })
            
            req.io.emit("order-cancelled", order);
            
            return res.status(200).json({ message: "Hủy đơn hàng thành công!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    searchOrderByConditions: async (req, res) => {
        try {
            const {
                order_id,
                staff_id,
                table_name,
                customer_name,
                start_date,
                end_date,
                status
            } = req.query;
            console.log("QUERY: ", req.query);
            if (!order_id && !staff_id && !table_name && !customer_name && !start_date && !status) {
                return res.status(400).json({ message: 'Vui lòng cung cấp ít nhất 1 tiêu chí tìm kiếm' });
            }

            const whereConditions = {
                [Op.and]: []
            };

            if (order_id) {
                whereConditions[Op.and].push({
                    id: { [Op.like]: `%${order_id}%` }
                });
            }

            if (status) {
                whereConditions[Op.and].push({ status });
            }

            if (start_date && end_date) {
                whereConditions[Op.and].push({
                    createdAt: {
                        [Op.between]: [new Date(start_date), new Date(end_date)],
                    }
                });
            } else if (start_date) {
                whereConditions[Op.and].push({
                    createdAt: {
                        [Op.gte]: new Date(start_date),
                    }
                });
            }

            const includeOptions = [];

            // Join Table nếu cần lọc theo tên bàn
            if (table_name) {
                includeOptions.push({
                    model: models.Table,
                    where: {
                        name: {
                            [Op.like]: `%${table_name}%`
                        }
                    }
                });
            } else {
                includeOptions.push({ model: models.Table });
            }

            // Join Customer nếu cần lọc theo tên khách hàng
            if (customer_name) {
                includeOptions.push({
                    model: models.Customer,
                    where: {
                        name: {
                            [Op.like]: `%${customer_name}%`
                        }
                    }
                });
            } else {
                includeOptions.push({ model: models.Customer });
            }
            if (staff_id) {
                includeOptions.push({
                    model: models.Staff,
                    where: {
                        id: staff_id
                    }
                });
            } else {
                includeOptions.push({ model: models.Staff });
            }


            const orders = await models.Order.findAll({
                where: whereConditions,
                include: includeOptions
            });
            return res.status(200).json({ data: orders });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    }
};

module.exports = Order;
