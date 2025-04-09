const models = require('../models/index');
const { Op } = require('sequelize');
const Food = {
    getFoods: async (req, res) => {
        try {
            let { page, limit } = req.query;

            page = parseInt(page) || 1;
            limit = parseInt(limit) || 7;

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
                data: foods,
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
            let { page, limit } = req.query;

            page = parseInt(page) || 1;
            limit = parseInt(limit) || 7;

            if (page < 1) page = 1;

            const offset = (page - 1) * limit;

            // Lấy danh sách món ăn theo phân trang
            const { count, rows: foods } = await models.Food.findAndCountAll({
                where: { is_deleted: true },
                include: {
                    model: models.Category,
                    attributes: ["name"]
                },
                limit: limit,
                offset: offset
            });

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
    addFood: async (req, res) => {
        try {
            const { name, category_id, image, price, description } = req.body;

            if (!name || !category_id || !price || !image)
                return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
            const existCategory = await models.Category.findOne({
                where: { id: category_id }
            });
            if (!existCategory) return res.status(400).json({ message: "Danh mục không tồn tại" });
            const existFoodName = await models.Food.findOne({
                where: { name: name }
            });
            if (existFoodName) return res.status(400).json({ message: "Tên món ăn đã tồn tại" });

            let foodId;
            let isUnique = false;
            while (!isUnique) {
                foodId = generateFoodCode();
                const existCode = await models.Category.findOne({
                    where: { id: foodId }
                });
                if (!existCode) isUnique = true;
            }
            const newFood = await models.Food.create({
                id: foodId,
                name: name,
                category_id: category_id,
                image: image,
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
            const { name, category_id, price, description, image } = req.body;
            console.log(req.body);

            if (!name || !category_id || !price || !foodId || !image) {
                return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
            }

            // 🔹 Kiểm tra món ăn hiện tại
            const existFood = await models.Food.findOne({ where: { id: foodId } });
            if (!existFood) return res.status(404).json({ message: "Món ăn không tồn tại" });

            // 🔹 Kiểm tra tên món có bị trùng không (trừ món hiện tại)
            const existFoodName = await models.Food.findOne({
                where: { name: name, id: { [Op.ne]: foodId } }
            });
            if (existFoodName) return res.status(400).json({ message: "Tên món ăn đã tồn tại" });

            // 🔹 Kiểm tra danh mục có tồn tại không
            const existCategory = await models.Category.findOne({ where: { id: category_id } });
            if (!existCategory) return res.status(400).json({ message: "Danh mục không tồn tại" });

            // 🔹 Tạo món ăn mới với ID mới
            await models.Food.update({
                name,
                category_id,
                price,
                description,
                image,
            }, { where: { id: foodId } });

            return res.status(200).json({ message: "Cập nhật món ăn thành công!" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi cập nhật món ăn" });
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
            // Kiểm tra đầu vào hợp lệ
            if (!Array.isArray(foodIds) || foodIds.length === 0) {
                return res.status(400).json({ message: "Danh sách món cần xóa không hợp lệ" });
            }

            // Kiểm tra món nào đang được sử dụng trong OrderDetail
            const usedFoods = await models.OrderDetail.findAll({
                where: { food_id: { [Op.in]: foodIds } },
                attributes: ['food_id'],
                raw: true
            });

            const usedFoodIds = new Set(usedFoods.map(item => Number(item.food_id)));  // Tạo tập hợp ID đã sử dụng
            const unUsedFoodIds = foodIds.filter(id => !usedFoodIds.has(Number(id)));  // Lọc món chưa dùng
            console.log(usedFoodIds);
            console.log(unUsedFoodIds);

            if (unUsedFoodIds.length === 0) {
                return res.status(400).json({ message: "Tất cả món ăn đều đang được sử dụng trong đơn hàng" });
            }

            // Cập nhật trạng thái is_deleted cho các món chưa được sử dụng
            const updatedFoods = await models.Food.update(
                { is_deleted: true },
                { where: { id: { [Op.in]: unUsedFoodIds } } }
            );

            if (updatedFoods[0] > 0) {
                return res.status(200).json({
                    message: `Đã xóa ${updatedFoods[0]} món ăn`,
                    usedFoodIds,
                    unUsedFoodIds
                });
            } else {
                return res.status(400).json({ message: "Không có món nào được xóa" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi xóa nhiều món ăn" });
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
            const { foodId, name, category_id, minPrice, maxPrice, page = 1, limit = 7 } = req.query;
            console.log(req.query);

            if (!foodId && !name && !category_id && !minPrice && !maxPrice)
                return res.status(400).json({ message: "Vui lòng cung cấp ít nhất một tiêu chí tìm kiếm" });

            const conditions = [];
            if (foodId) conditions.push({ id: { [Op.like]: `%${foodId}%` }, is_deleted: false });
            if (name) conditions.push({ name: { [Op.like]: `%${name}%` }, is_deleted: false });
            if (category_id) conditions.push({ category_id: category_id, is_deleted: false });

            if (minPrice && maxPrice)
                conditions.push({ price: { [Op.between]: [minPrice, maxPrice] }, is_deleted: false });
            else if (minPrice)
                conditions.push({ price: { [Op.gte]: minPrice }, is_deleted: false });
            else if (maxPrice)
                conditions.push({ price: { [Op.lte]: maxPrice }, is_deleted: false });

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows } = await models.Food.findAndCountAll({
                where: { [Op.or]: conditions },
                include: {
                    model: models.Category,
                    attributes: ["name"]
                },
                limit: parseInt(limit),
                offset: offset
            });

            return res.status(200).json({
                data: rows,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi tìm kiếm nguyên liệu" });
        }
    },
    findFoodsDeleted: async (req, res) => {
        try {
            const { foodId, name, category_id, minPrice, maxPrice } = req.query;

            if (!foodId && !name && !category_id && !minPrice && !maxPrice)
                return res.status(400).json({ message: "Vui lòng cung cấp ít nhất một tiêu chí tìm kiếm" });
            const conditions = [];
            if (foodId) conditions.push({ id: foodId, is_deleted: true });
            if (name) conditions.push({ name: { [Op.like]: `%${name}%` }, is_deleted: true });
            if (category_id) conditions.push({ category_id: category_id, is_deleted: true });

            if (minPrice && maxPrice)
                conditions.push({ price: { [Op.between]: [minPrice, maxPrice] }, is_deleted: true });
            else if (minPrice)
                conditions.push({ price: { [Op.lte]: minPrice }, is_deleted: true });
            else
                conditions.push({ price: { [Op.gte]: maxPrice }, is_deleted: true });

            const foundFoods = await models.Food.findAll({
                where: { [Op.or]: conditions },
                include: {
                    model: models.Category,
                    attributes: ["name"]
                }
            });
            return res.status(200).json({ message: `Đã tìm thấy ${foundFoods.length} món ăn`, foundFoods });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi tìm kiếm món ăn" });
        }
    },
    restoreFoods: async (req, res) => {
        try {
            const { foodIds } = req.body;
            const { count, rows } = await models.Food.findAndCountAll({
                where: { is_deleted: true, id: { [Op.in]: foodIds } },
                attributes: ["id"]
            });
            const foodIdList = rows.map(food => food.id);

            if (count === 0) return res.status(404).json({ message: "Không tìm thấy món cần khôi phục" });
            await models.Food.update(
                { is_deleted: false },
                { where: { id: { [Op.in]: foodIdList } } });
            return res.status(200).json({ message: "Khôi phục món ăn thành công" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi khôi phục một món ăn" });
        }
    },
    getFoodAvailable: async (req, res) => {
        try {
            const foods = await models.Food.findAll({
                where: { is_deleted: false },
                include: [
                    {
                        model: models.Recipe,
                        include: {
                            model: models.Ingredient,
                            attributes: ["id", "name", "quantity"]
                        }
                    }
                ]
            });
            console.log(foods);
            const availableFoods = foods.map(food => {
                let minPossible = Infinity;
                food.FoodIngredients.forEach(ingredient => {
                    if (ingredient.Ingredient) {
                        const possible = Math.floor(ingredient.Ingredient.stock / ingredient.quantity);
                        minPossible = Math.min(minPossible, possible);
                    }
                });
                return {
                    id: food.id,
                    name: food.name,
                    maxAvailable: minPossible === Infinity ? 0 : minPossible
                };
            });

            return res.status(200).json({ message: "Số lượng món có thể chế biến", availableFoods });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi tính số lượng món có thể chế biến" });
        }
    }
};

const generateFoodCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
module.exports = Food;