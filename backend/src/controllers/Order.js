const models = require('../models/index');
const { Op } = require('sequelize');

const Order = {
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
            req.io.emit("order-created", createdOrder);

            return res.status(200).json({ message: "Tạo đơn hàng thành công", data: createdOrder });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    },
    getOrdersByStatus: async (req, res) => {
        try {
            const { status } = req.query;
            const orders = await models.Order.findAll({ where: { status: status } });
            return res.status(200).json({ data: orders })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server", error });
        }
    }

};

module.exports = Order;
