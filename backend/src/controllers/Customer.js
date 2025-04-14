const models = require('../models/index');
const { Op } = require('sequelize');

const Customer = {
    findCustomers: async (req, res) => {
        try {
            const { name, phone } = req.query;
            console.log({ name, phone })
            if (!name && !phone)
                return res.status(400).json({ message: "Vui lòng cung cấp ít nhất 1 tiêu chí tìm kiếm khách hàng" });

            const conditions = {};
            if (name) {
                conditions.name = { [Op.like]: `%${name}%` };
            }
            if (phone) {
                conditions.phone = { [Op.like]: `%${phone}%` };
            }

            const customers = await models.Customer.findAll({
                where: conditions
            });

            return res.status(200).json(customers);
        } catch (error) {
            console.error("Error finding customers:", error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    },
};

module.exports = Customer;
