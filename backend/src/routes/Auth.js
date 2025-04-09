const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth');

router.post('/login', AuthController.login); // Lấy ra user theo email và password sau đó sign token
module.exports = router;