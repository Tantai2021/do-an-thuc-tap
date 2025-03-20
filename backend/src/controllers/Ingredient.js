const { Op } = require('sequelize');
const models = require('../models/index');

const Ingredient = {
    getIngredients: async (req, res) => {
        try {
            const ingredients = await models.Ingredient.findAll({
                where: { is_deleted: false }
            });
            if (ingredients.length == 0) return res.status(400).json({ message: "Không có nguyên liệu" })
            return res.status(200).json(ingredients);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách nguyên liệu", error });
        }
    },
    getIngredientDeleted: async (req, res) => {
        try {
            const ingredients = await models.Ingredient.findAll({
                where: { is_deleted: true }
            });
            if (ingredients.length == 0) return res.status(400).json({ message: "Không có nguyên liệu" })
            return res.status(200).json(ingredients);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách nguyên liệu", error });
        }
    },
    getIngredientById: async (req, res) => {
        try {
            const ingredientId = req.params.id;
            const ingredient = await models.Ingredient.findOne({
                where: { id: ingredientId, is_deleted: false }
            });
            if (ingredient) return res.status(200).json(ingredient);
            return res.status(400).json({ message: "Nguyên liệu không tồn tại" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi tìm nguyên liệu" });
        }
    },
    addIngredient: async (req, res) => {
        try {
            const { name, unit } = req.body;
            console.log(req.body)

            if (!name || !unit) {
                return res.status(400).json({ message: "Tên và đơn vị nguyên liệu không được để trống" });
            }
            const existIngredient = await models.Ingredient.findOne({
                where: { name: name }
            });
            if (existIngredient) return res.status(400).json({ message: "Tên nguyên liệu đã tồn tại" });
            const newIngredient = await models.Ingredient.create({
                name: name,
                unit: unit
            });
            if (newIngredient) return res.status(200).json({ message: "Đã thêm nguyên liệu mới", newIngredient: newIngredient });
            else return res.status(400).json({ message: "Thêm nguyên liệu mới thất bại" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi thêm nguyên liệu" });
        }
    },
    updateIngredient: async (req, res) => {
        try {
            const { name, unit } = req.body;
            const ingredientId = req.params.id;

            if (!name || !unit || !ingredientId)
                return res.status(400).json({ message: "Thiếu thông tin nguyên liệu" });

            const existIngredient = await models.Ingredient.findOne({
                where: { id: ingredientId }
            });
            if (!existIngredient)
                return res.status(404).json({ message: "Nguyên liệu này không tồn tại" });

            const existIngredientName = await models.Ingredient.findOne({
                where: { name: name }
            })
            if (existIngredientName && existIngredientName.id !== ingredientId)
                return res.status(400).json({ message: "Tên nguyên liệu đã tồn tại" });
            const newIngredient = await existIngredient.update({
                name: name,
                unit: unit
            });
            if (newIngredient) return res.status(200).json({ message: "Đã cập nhật nguyên liệu mới", newIngredient });
            else return res.status(400).json({ message: "Không thể cập nhật nguyên liệu" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi sửa nguyên liệu" });
        }
    },
    deleteIngredient: async (req, res) => {
        try {
            const ingredientId = req.params.id;
            const existIngredient = await models.Ingredient.findOne({
                where: { id: ingredientId }
            });
            if (!existIngredient)
                return res.status(404).json({ message: "Không tồn tại nguyên liệu" });

            const ingredientUsedInFood = await models.Food_Ingredient.findOne({
                where: { ingredient_id: ingredientId }
            });
            if (ingredientUsedInFood)
                return res.status(400).json({ message: "Nguyên liệu đang được sử dụng" });

            const softDeleted = await models.Ingredient.update(
                { is_deleted: true },
                { where: { id: ingredientId } }
            );
            if (softDeleted) return res.status(200).json({ message: "Đã xóa nguyên liệu này" });
            else return res.status(400).json({ message: "Không thể xóa nguyên liệu này" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi xóa nguyên liệu" });
        }
    },
    restoreIngredient: async (req, res) => {
        try {
            const ingredientId = req.params.id;
            const existIngredient = await models.Ingredient.findOne({
                where: { id: ingredientId, is_deleted: true }
            });
            if (!existIngredient)
                return res.status(404).json({ message: "Không tìm thấy nguyên liệu bị xóa" });
            const restoredIngredient = await existIngredient.update({
                is_deleted: false
            })
            if (restoredIngredient) return res.status(200).json({ message: "Đã khôi phục nguyên liệu" });
            else return res.status(400).json({ message: "Đã xảy ra lỗi" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi khôi phục nguyên liệu" });
        }
    },
    deleteIngredients: async (req, res) => {
        try {
            const { ingredientIds } = req.body;
            if (!ingredientIds || !Array.isArray(ingredientIds) || ingredientIds.length === 0)
                return res.status(404).json({ message: "Danh sách nguyên liệu không hợp lệ" });

            const usedIngredients = await models.Food_Ingredient.findAll({
                where: { ingredient_id: { [Op.in]: ingredientIds } },
                attributes: ['ingredient_id']
            });
            const usedIngredientIds = usedIngredients.map(item => item.ingredient_id);

            const unUsedIngredientIds = ingredientIds.filter((id) => !usedIngredientIds.includes(id));

            if (unUsedIngredientIds.length === 0) {
                return res.status(400).json({
                    message: "Không thể xóa các nguyên liệu vì chúng đang được sử dụng",
                    usedIngredientIds
                });
            }

            const updatedIngredients = await models.Ingredient.update(
                { is_deleted: true },
                { where: { id: { [Op.in]: unUsedIngredientIds } } });
            console.log(updatedIngredients);

            if (updatedIngredients > 0)
                return res.status(200).json({
                    message: `Đã xóa ${updatedIngredients} nguyên liệu`,
                    deletedIngredientIds: unUsedIngredientIds,
                    usedIngredientIds
                });
            return res.status(400).json({ message: "Đã xảy ra lỗi khi xóa nhiều nguyên liệu", unUsedIngredientIds });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi thực hiện xóa nhiều nguyên liệu" });
        }
    },
    findIngredients: async (req, res) => {
        try {
            const { ingredientId, name, unit } = req.body;
            if (!ingredientId && !name && !unit) {
                return res.status(400).json({ message: "Vui lòng cung cấp ít nhất một tiêu chí tìm kiếm" });
            }
            let conditions = [];
            if (ingredientId) conditions.push({ id: ingredientId });
            if (name) conditions.push({ name: { [Op.like]: `%${name}%` } });
            if (unit) conditions.push({ unit: unit });
            const foundIngredients = await models.Ingredient.findAll({
                where: {
                    [Op.or]: conditions
                }
            });
            if (foundIngredients.length === 0)
                return res.status(404).json({ message: "Không tìm thấy nguyên liệu nào" });
            return res.status(200).json({ message: `Đã tìm thấy ${foundIngredients.length} nguyên liệu`, foundIngredients });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi khi thực hiện tìm nguyên liệu" });
        }
    }
};
module.exports = Ingredient;