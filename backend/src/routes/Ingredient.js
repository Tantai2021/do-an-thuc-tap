//backend/src/routes/Ingredient
const express = require('express');
const router = express.Router();

const Authenticate = require("../middleware/Authenticate");
const Authorize = require("../middleware/Authorize");
const IngredientController = require('../controllers/Ingredient');

router.use(Authenticate, Authorize(["admin"]));
router.get('/', IngredientController.getIngredients); // Lấy tất cả nguyên liệu 
router.get('/deleted', IngredientController.getIngredientsDeleted); // Lấy tất cả nguyên liệu đã bị soft deleted
router.get('/search', IngredientController.findIngredients); // Tìm kiếm nguyên liệu
router.get('/:id', IngredientController.getIngredientById); // Tìm nguyên liệu theo id

router.post('/', IngredientController.addIngredient); // Thêm nguyên liệu mới
router.put('/:id', IngredientController.updateIngredient); // Cập nhật nguyên liệu
router.delete('/bulk-delete', IngredientController.deleteIngredients); // Xóa mềm nhiều nguyên liệu
router.delete('/:id', IngredientController.deleteIngredient); // Xóa mềm nguyên liệu
router.patch('/restore/bulk-restore', IngredientController.restoreIngredients); // Khôi phục nhiều nguyên liệu
router.patch('/restore/:id', IngredientController.restoreIngredient); // Khôi phục nguyên liệu
module.exports = router;