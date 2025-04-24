const express = require('express');
const router = express.Router();

const Authenticate = require("../middleware/Authenticate");
const Authorize = require("../middleware/Authorize");
const FoodController = require('../controllers/Food');

router.get('/', FoodController.getFoods); // Lấy tất cả món ăn chưa bị soft deleted
router.get('/all', FoodController.getAllFood); // Lấy tất cả món ăn chưa bị soft deleted
router.get('/available', FoodController.getFoodAvailable); // Lấy tất cả món ăn có thể chế biến
router.get('/deleted', FoodController.getFoodsDeleted); // Lấy tất cả món ăn đã bị soft deleted
router.get('/search', FoodController.findFoods); // Tìm kiếm món ăn
router.get('/search/deleted', FoodController.findFoodsDeleted); // Tìm kiếm món ăn
router.get('/:id', FoodController.getFoodByid); // Tìm món ăn theo id

router.use(Authenticate)
router.post('/', Authorize(["admin"]), FoodController.addFood); // Thêm một món ăn mới

router.delete('/bulk-delete', FoodController.deleteFoods); // Xóa mềm nhiều món ăn
router.delete('/:id', FoodController.deleteFood); // Xóa mềm một món ăn

router.put('/:id', Authorize(["admin"]), FoodController.updateFood); // Cập nhật một món ăn

router.patch('/restore/bulk-restore', FoodController.restoreFoods); // Khôi phục món ăn đã bị xóa mềm
router.patch('/restore/:id', FoodController.restoreFood); // Khôi phục món ăn đã bị xóa mềm

module.exports = router;