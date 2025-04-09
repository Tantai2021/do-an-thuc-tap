const models = require('../models'); // Import Sequelize models
const { Op } = require('sequelize');

const Recipe = {
    // 1️⃣ Xem công thức món ăn
    getRecipesOfFood: async (req, res) => {
        try {
            const foodId = req.params.foodId;

            const food = await models.Food.findOne({ where: { id: foodId }, attributes: ["name", "image"] });

            let recipes = await models.Recipe.findAll({
                where: { food_id: foodId },
                include: [
                    {
                        model: models.Ingredient,
                        attributes: ["id", "name", "unit"]
                    }
                ],
                attributes: ["ingredient_id", "quantity"],
            });
            recipes = recipes.map(recipe => ({
                ingredient_id: recipe.ingredient.id,
                ingredient_name: recipe.ingredient.name,
                ingredient_unit: recipe.ingredient.unit,
                quantity: recipe.quantity
            }));
            return res.status(200).json({ food: food, ingredients: recipes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi xem công thức" });
        }
    },

    // 3️⃣ Tạo công thức mới
    createRecipe: async (req, res) => {
        try {
            const { foodId, ingredients } = req.body;

            if (!foodId || !ingredients || ingredients.length === 0)
                return res.status(400).json({ message: "Thiếu thông tin công thức" });

            const existFood = await models.Food.findOne({ where: { id: foodId } });
            if (!existFood) return res.status(404).json({ message: "Không tìm thấy món ăn" });

            // Thêm nguyên liệu vào công thức (nếu có)
            const recipeIngredients = ingredients.map(({ ingredient_id, quantity }) => ({
                food_id: foodId,
                ingredient_id: ingredient_id,
                quantity: quantity || 1 // Nếu không có quantity, mặc định là 1
            }));
            await models.Recipe.bulkCreate(recipeIngredients);

            res.status(201).json({ message: "Thêm công thức thành công", data: recipeIngredients });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi tạo công thức mới" });
        }
    },


    // 4️⃣ Cập nhật công thức
    updateRecipe: async (req, res) => {
        try {
            const foodId = req.params.foodId;
            const { ingredients } = req.body;

            const existRecipe = await models.Recipe.findOne({ where: { food_id: foodId } });
            if (!existRecipe) return res.status(404).json({ message: "Không tìm thấy công thức" });

            // Cập nhật nguyên liệu (xóa cũ, thêm mới)
            if (ingredients && ingredients.length > 0) {
                await models.Recipe.destroy({ where: { food_id: foodId } });
                const newIngredients = ingredients.map(({ ingredient_id, quantity }) => ({
                    food_id: foodId,
                    ingredient_id: ingredient_id,
                    quantity: quantity
                }));
                await models.Recipe.bulkCreate(newIngredients);
            }

            return res.status(200).json({ message: "Cập nhật công thức thành công" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi cập nhật công thức" });
        }
    },

    // 5️⃣ Xóa công thức (soft delete)
    deleteRecipe: async (req, res) => {
        try {
            const foodId = req.params.foodId;

            const existRecipe = await models.Recipe.findOne({ where: { food_id: foodId } });
            if (!existRecipe) return res.status(404).json({ message: "Không tìm thấy công thức" });

            // Kiểm tra món ăn có trong đơn hàng chưa hoàn thành không
            const activeOrders = await models.OrderDetail.findOne({
                where: {
                    food_id: foodId,
                    status: { [Op.notIn]: ["Served", "Canceled"] } // Chỉ kiểm tra đơn hàng chưa hoàn thành
                }
            });

            if (activeOrders) {
                return res.status(400).json({ message: "Không thể xóa, món ăn đang có trong đơn hàng chưa hoàn thành" });
            }

            await models.Recipe.destroy({ where: { food_id: foodId } });

            res.status(200).json({ message: "Xóa công thức thành công" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi xóa công thức" });
        }
    }
};

module.exports = Recipe;
