const models = require('../models/index');
const { Op } = require('sequelize');

const Area = {
    // 1️⃣ Lấy danh sách danh mục
    getAreas: async (req, res) => {
        try {
            const areas = await models.Area.findAll();
            return res.status(200).json({ data: areas });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách danh mục" });
        }
    },

};

module.exports = Area;
