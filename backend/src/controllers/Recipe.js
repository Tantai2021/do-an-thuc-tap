const models = require('../models'); // Import Sequelize models
const { Op } = require('sequelize');

const Recipe = {
    // 1️⃣ Xem công thức món ăn
    getRecipesOfFood: async (req, res) => {
        try {
            const foodId = req.params.foodId;

            const food = await models.Food.findOne({ where: { id: foodId } });
            if (!food)
                return res.status(404).json({ message: "Không tìm thấy món ăn" });

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
            return res.status(200).json({ data: recipes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi khi xem công thức" });
        }
    },

    // 3️⃣ Tạo công thức mới
    createRecipe: async (req, res) => {
        try {
            const { foodId, ingredientId, quantity } = req.body;

            if (!foodId || !ingredientId || !quantity)
                return res.status(400).json({ message: "Thiếu thông tin công thức" });

            const existFood = await models.Food.findOne({ where: { id: foodId } });
            if (!existFood) return res.status(404).json({ message: "Không tìm thấy món ăn" });

            await models.Recipe.create({
                food_id: foodId,
                ingredient_id: ingredientId,
                quantity: quantity
            });

            return res.status(201).json({ message: "Thêm công thức thành công", data: recipeIngredients });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi tạo công thức mới" });
        }
    },
    createRecipes: async (req, res) => {
        try {
            const { formRecipes } = req.body;
            if (!formRecipes || !Array.isArray(formRecipes))
                return res.status(400).json({ message: "Danh sách nguyên liệu không hợp lệ" });

            const isValidated = formRecipes.every(recipe =>
                Object.values(recipe).every(val =>
                    val !== undefined &&
                    val !== null &&
                    (typeof val === 'number' ? val > 0 : val !== "")
                )
            );
            if (!isValidated)
                return res.status(401).json({ message: "Thông tin không hợp lệ" });


            const existedRecipes = await models.Recipe.findAll({
                where: {
                    food_id: formRecipes[0].food_id // tất cả formRecipes đều thuộc cùng một món
                },
                attributes: ['ingredient_id']
            });

            const existedIngredientIds = existedRecipes.map(recipe => recipe.ingredient_id);

            const hasDuplicate = formRecipes.some(recipe =>
                existedIngredientIds.includes(recipe.ingredientId)
            );
            if (hasDuplicate) {
                return res.status(409).json({ message: "Một số nguyên liệu đã tồn tại trong công thức" });
            }

            const safeRecipes = formRecipes.map(({ ingredient_id, quantity, food_id }) => ({
                food_id: food_id,
                ingredient_id: ingredient_id,
                quantity: quantity
            }));
            const response = await models.Recipe.bulkCreate(safeRecipes);
            return res.status(201).json({ message: "Thêm công thức thành công" });
        } catch (error) {
            return res.status(500).json(error);
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
