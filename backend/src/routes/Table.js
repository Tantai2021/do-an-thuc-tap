const express = require('express');
const router = express.Router();
const TableController = require('../controllers/Table');
const Authenticate = require("../middleware/Authenticate");
const Authorize = require("../middleware/Authorize");

// Lấy danh sách tất cả bàn ăn
router.get('/', TableController.getTables);

// Lấy danh sách bàn theo khu vực
router.get('/area/:areaId', TableController.getTablesByArea);

// Lấy thông tin chi tiết của một bàn ăn theo ID
router.get('/:tableId', TableController.getTableById);

// Thêm bàn ăn mới
router.post('/', TableController.createTable);

// Cập nhật thông tin bàn ăn
router.put('/:tableId', TableController.updateTable);

// Xóa bàn ăn
router.delete('/:tableId', TableController.deleteTable);

// Khôi phục
router.patch('/:tableId', TableController.restoreTable);

// Cập nhật trạng thái bàn
router.patch('/:tableId/status', TableController.updateTableStatus);

module.exports = router;
