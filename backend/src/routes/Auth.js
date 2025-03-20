const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth');

router.post('/login', AuthController.getUserByEmail); // Lấy ra user theo email và password sau đó sign token
router.post('/register', AuthController.createUser); // Đăng ký tài khoản cho user (có kiểm tra trùng email và mã hóa mật khẩu);

router.put('/:id', AuthController.updateUser); // Cập nhật thông tin user (có kiểm tra trùng email và mã hóa mật khẩu)
module.exports = router;