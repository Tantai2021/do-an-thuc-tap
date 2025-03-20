//backend/src/routes/Ingredient
const express = require('express');
const router = express.Router();

const IngredientController = require('../controllers/Ingredient');

router.get('/', IngredientController.getIngredients); // Lấy tất cả nguyên liệu 
router.get('/deleted', IngredientController.getIngredientDeleted); // Lấy tất cả nguyên liệu đã bị soft deleted
router.get('/search', IngredientController.findIngredients); // Tìm kiếm nguyên liệu
router.get('/:id', IngredientController.getIngredientById); // Tìm nguyên liệu theo id

router.post('/', IngredientController.addIngredient); // Thêm nguyên liệu mới
router.put('/:id', IngredientController.updateIngredient); // Cập nhật nguyên liệu
router.delete('/bulk-delete', IngredientController.deleteIngredients); // Xóa mềm nhiều nguyên liệu
router.delete('/:id', IngredientController.deleteIngredient); // Xóa mềm nguyên liệu
router.patch('/restore/:id', IngredientController.restoreIngredient); // Khôi phục nguyên liệu
module.exports = router;