const express = require('express');
const FoodController = require('../controllers/Food');

const router = express.Router();
router.get('/', FoodController.getFoods); // Lấy tất cả món ăn chưa bị soft deleted
router.get('/deleted', FoodController.getFoodsDeleted); // Lấy tất cả món ăn đã bị soft deleted
router.get('/search', FoodController.findFoods); // Tìm kiếm món ăn
router.get('/:id', FoodController.getFoodByid); // Tìm món ăn theo id
router.post('/', FoodController.addFood); // Thêm một món ăn mới
router.delete('/bulk-delete', FoodController.deleteFoods); // Xóa mềm nhiều món ăn
router.delete('/:id', FoodController.deleteFood); // Xóa mềm một món ăn
router.put('/:id', FoodController.updateFood); // Cập nhật một món ăn
router.patch('/restore/:id', FoodController.restoreFood); // Khôi phục món ăn đã bị xóa mềm

module.exports = router;