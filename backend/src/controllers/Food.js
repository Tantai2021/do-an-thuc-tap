const models = require('../models/index');
const { Op } = require('sequelize');
const Food = {
    getFoods: async (req, res) => {
        try {
            let { page } = req.query;

            page = parseInt(page) || 1;
            limit = 7;

            if (page < 1) page = 1;

            const offset = (page - 1) * limit;

            // Lấy danh sách món ăn theo phân trang
            const { count, rows: foods } = await models.Food.findAndCountAll({
                where: { is_deleted: false },
                include: {
                    model: models.Category,
                    attributes: ["name"]
                },
                limit: limit,
                offset: offset
            });

            if (foods.length === 0) {
                return res.status(404).json({ message: "Không có món ăn nào" });
            }

            return res.status(200).json({
                message: "Danh sách món ăn",
                foods,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                pageSize: limit
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách món" });
        }
    },
    getFoodByid: async (req, res) => {
        try {
            const foodId = req.params.id;
            const existFood = await models.Food.findOne({
                where: { id: foodId, is_deleted: false }
            });
            if (!existFood) return res.status(404).json({ message: "Không tìm thấy món ăn" });
            return res.status(200).json({ message: "Đã tìm thấy.", existFood });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi tìm món ăn" });
        }
    },
    getFoodsDeleted: async (req, res) => {
        try {
            const foods = await models.Food.findAll({
                where: { is_deleted: true }
            });
            console.log(foods);

            if (foods.length == 0)
                return res.status(404).json({ message: "Không có món ăn nào" });
            else return res.status(200).json({ message: "Danh sách món ăn đã bị xóa", foods: foods });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách món" });
        }
    },
    addFood: async (req, res) => {
        try {
            const { name, category_id, price, description } = req.body;

            if (!name || !category_id || !price)
                return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
            const existCategory = await models.Category.findOne({
                where: { id: category_id }
            });
            if (!existCategory) return res.status(400).json({ message: "Danh mục không tồn tại" });
            q
            const existFoodName = await models.Food.findOne({
                where: { name: name }
            });
            if (existFoodName) return res.status(400).json({ message: "Tên món ăn đã tồn tại" });
            const newFood = await models.Food.create({
                name: name,
                category_id: category_id,
                price: price,
                description: description
            });
            if (newFood) return res.status(200).json({ message: "Thêm món ăn mới thành công" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi thêm món ăn mới" });
        }
    },
    updateFood: async (req, res) => {
        try {
            const foodId = req.params.id;
            const { name, category_id, price, description } = req.body;

            if (!name || !category_id || !price || !foodId)
                return res.status(400).json({ message: "Thiếu thông tin cần thiết" });

            const existFood = await models.Food.findOne({
                where: { id: foodId }
            });
            if (!existFood) return res.status(404).json({ message: "Món ăn không tồn tại" });

            const existFoodName = await models.Food.findOne({
                where: { name: name, id: { [Op.ne]: foodId } }
            });
            if (existFoodName)
                return res.status(400).json({ message: "Tên món ăn đã tồn tại" });

            const existCategory = await models.Category.findOne({
                where: { id: category_id }
            });
            if (!existCategory) return res.status(400).json({ message: "Danh mục không tồn tại" });

            const updatedFood = await models.Food.update({
                name: name,
                category_id: category_id,
                price: price,
                description: description
            }, { where: { id: foodId } });
            if (updatedFood) return res.status(200).json({ message: "Cập nhật món ăn thành công", updatedFood });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi cập nhật món ăn mới" });
        }
    },
    deleteFood: async (req, res) => {
        try {
            const foodId = req.params.id;
            const existFood = await models.Food.findOne({
                where: { id: foodId }
            });
            if (!existFood) return res.status(404).json({ message: "Không tìm thấy món ăn cần xóa" });

            const usedFood = await models.OrderDetail.findOne({
                where: { food_id: existFood.id }
            });
            if (usedFood) return res.status(400).json({ message: "Món đang được sử dụng" });

            await existFood.update({ is_deleted: true });
            return res.status(200).json({ message: "Đã xóa một món ăn" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi xóa một món ăn" });
        }
    },
    deleteFoods: async (req, res) => {
        try {
            const { foodIds } = req.body;
            if (!foodIds || !Array.isArray(foodIds) || foodIds.length === 0)
                return res.status(404).json({ message: "Danh sách món cần xóa không hợp lệ" });
            const usedFoods = await models.OrderDetail.findAll({
                where: { food_id: { [Op.in]: foodIds } },
                attributes: ['food_id']
            });
            const usedFoodIds = usedFoods.map(item => item.food_id);
            const unUsedFoodIds = foodIds.filter(id => !usedFoodIds.includes(id));
            if (unUsedFoodIds.length == 0)
                return res.status(400).json({ message: "Tất cả món đều được sử dụng" });
            const [updatedFoods] = await models.Food.update(
                { is_deleted: true },
                { where: { id: { [Op.in]: unUsedFoodIds } } });
            if (updatedFoods > 0)
                return res.status(200).json({ message: `Đã xóa ${updatedFoods} món ăn`, usedFoodIds, unUsedFoodIds });
            else
                return res.status(400).json({ message: "Không có món nào được xóa" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi nhiều món ăn" });
        }
    },
    restoreFood: async (req, res) => {
        try {
            const foodId = req.params.id;
            const existFood = await models.Food.findOne({
                where: { id: foodId, is_deleted: true }
            });
            if (!existFood) return res.status(404).json({ message: "Không tìm thấy món cần khôi phục" });
            await existFood.update({ is_deleted: false });
            return res.status(200).json({ message: "Khôi phục món ăn thành công" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi khôi phục một món ăn" });
        }
    },
    findFoods: async (req, res) => {
        try {
            const { foodId, name, category_id, minPrice, maxPrice } = req.body;
            if (!foodId && !name && !category_id && !minPrice && !maxPrice)
                return res.status(400).json({ message: "Vui lòng cung cấp ít nhất một tiêu chí tìm kiếm" });
            const conditions = [];
            if (foodId) conditions.push({ id: foodId });
            if (name) conditions.push({ name: { [Op.like]: `%${name}%` } });
            if (category_id) conditions.push({ category_id: category_id });

            if (minPrice && maxPrice)
                conditions.push({ price: { [Op.between]: [minPrice, maxPrice] } });
            else if (minPrice)
                conditions.push({ price: { [Op.lte]: minPrice } });
            else
                conditions.push({ price: { [Op.gte]: maxPrice } });

            const foundFoods = await models.Food.findAll({
                where: { [Op.or]: conditions }
            });
            if (foundFoods.length === 0)
                return res.status(400).json({ message: "Không tìm thấy món nào" });
            return res.status(200).json({ message: `Đã tìm thấy ${foundFoods.length} món ăn`, foundFoods });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi tìm kiếm nguyên liệu" });
        }
    }
};
module.exports = Food;