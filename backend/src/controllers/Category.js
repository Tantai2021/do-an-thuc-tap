const models = require('../models/index');
const { Op } = require('sequelize');

const Category = {
    // 1️⃣ Lấy danh sách danh mục
    getCategories: async (req, res) => {
        try {
            const categories = await models.Category.findAll({
                where: { is_deleted: false },
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ categories });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách danh mục" });
        }
    },

    // 2️⃣ Lấy danh mục theo ID
    getCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await models.Category.findOne({
                where: { id, is_deleted: false }
            });

            if (!category) {
                return res.status(404).json({ message: "Không tìm thấy danh mục" });
            }

            return res.status(200).json({ category });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh mục" });
        }
    },

    // 3️⃣ Cập nhật danh mục
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Tên danh mục không được để trống" });
            }

            const category = await models.Category.findOne({ where: { id, is_deleted: false } });
            if (!category) {
                return res.status(404).json({ message: "Không tìm thấy danh mục" });
            }

            await category.update({ name });

            return res.status(200).json({ message: "Cập nhật danh mục thành công", category });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi cập nhật danh mục" });
        }
    },

    // 4️⃣ Xóa danh mục (Xóa mềm)
    softDeleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const category = await models.Category.findOne({ where: { id, is_deleted: false } });
            if (!category) {
                return res.status(404).json({ message: "Không tìm thấy danh mục" });
            }

            const existFoods = await models.Food.findAll({
                where: { category_id: id }
            })

            if (existFoods)
                return res.status(400).json({ message: "Không thể xóa danh mục này" });

            await category.update({ is_deleted: true });

            return res.status(200).json({ message: "Xóa danh mục thành công" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi xóa danh mục" });
        }
    },

    // 5️⃣ Khôi phục danh mục
    restoreCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const category = await models.Category.findOne({ where: { id, is_deleted: true } });
            if (!category) {
                return res.status(404).json({ message: "Không tìm thấy danh mục đã bị xóa" });
            }

            await category.update({ is_deleted: false });

            return res.status(200).json({ message: "Khôi phục danh mục thành công", category });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi khôi phục danh mục" });
        }
    },

    // 6️⃣ Thêm danh mục mới
    addCategory: async (req, res) => {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
            }

            // Kiểm tra trùng lặp danh mục
            const existCategory = await models.Category.findOne({
                where: { name: { [Op.eq]: name } }
            });

            if (existCategory) {
                return res.status(400).json({ message: "Danh mục này đã tồn tại" });
            }

            // Tạo mã danh mục duy nhất (6 ký tự)
            let categoryId;
            let isUnique = false;
            while (!isUnique) {
                categoryId = generateCategoryCode();
                const existCode = await models.Category.findOne({ where: { id: categoryId } });
                if (!existCode) isUnique = true;
            }

            // Thêm danh mục mới
            const newCategory = await models.Category.create({
                id: categoryId,
                name,
                is_deleted: false
            });

            return res.status(201).json({ message: "Thêm danh mục thành công", category: newCategory });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi thêm danh mục" });
        }
    }
};

// Hàm tạo mã danh mục ngẫu nhiên (6 ký tự chữ và số)
const generateCategoryCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = Category;
