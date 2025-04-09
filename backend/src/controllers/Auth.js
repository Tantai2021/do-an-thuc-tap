const models = require('../models/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password)
                return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
            const existUser = await models.User.findOne({
                where: { username: username },
                attributes: ['id', 'username', 'password', 'role']
            });
            if (!existUser) return res.status(404).json({ message: "Tài khoản người dùng không tồn tại" });
            const isMatch = await bcrypt.compare(password.trim(), existUser.password);

            if (!isMatch)
                return res.status(400).json({ message: "Mật khẩu không chính xác" });
            // Chỉ ký thông tin cần thiết
            const payload = {
                id: existUser.id,
                username: existUser.username,
                role: existUser.role
            };

            const userToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });
            return res.status(200).json({
                message: "Đăng nhập thành công",
                user: payload,
                token: userToken
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Có lỗi xử lý từ máy chủ" });
        }
    },

};
module.exports = User;