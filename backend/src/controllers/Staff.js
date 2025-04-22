const models = require('../models/index');
const { Op } = require('sequelize');

const Staff = {
    searchStaff: async (req, res) => {
        try {
            const { search } = req.query;
            const staffs = await models.Staff.findAll({
                where: {
                    [Op.or]: [
                        { id: { [Op.like]: `%${search}%` } },  // Tìm kiếm theo ID (nếu có thể là số hoặc chuỗi)
                        { fullname: { [Op.like]: `%${search}%` } },  // Tìm kiếm theo tên đầy đủ (không phân biệt chữ hoa chữ thường)
                        { email: { [Op.like]: `%${search}%` } },  // Tìm kiếm theo email
                        { phone: { [Op.like]: `%${search}%` } }   // Tìm kiếm theo số điện thoại
                    ]
                }
            });
            return res.status(200).json(staffs);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }
};

module.exports = Staff;
