const express = require('express');
const router = express.Router();
const RecipeController = require("../controllers/Recipe");

// Lấy danh sách tất cả công thức
router.get('/:foodId', RecipeController.getRecipesOfFood);

// Thêm một công thức mới
router.post('/', RecipeController.createRecipe);

// Cập nhật một công thức theo ID
router.put('/:foodId', RecipeController.updateRecipe);

// Xóa một công thức (soft delete)
router.delete('/:foodId', RecipeController.deleteRecipe);

module.exports = router;