const models = require('../models/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = {
    getUserByEmail: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password)
                return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
            const existUser = await models.User.findOne({
                where: { email: email },
                attributes: ['id', 'name', 'email', 'password', 'role']
            });
            if (!existUser) return res.status(404).json({ message: "Tài khoản người dùng không tồn tại" });

            const isMatch = await bcrypt.compare(password, existUser.password);
            if (!isMatch)
                return res.status(400).json({ message: "Mật khẩu không chính xác" });
            console.log(typeof existUser);
            console.log(existUser);

            const userToken = jwt.sign(existUser.toJSON(), process.env.SECRET_KEY, { expiresIn: "1h" });
            return res.status(200).json({ message: "Đăng nhập thành công", userToken });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi xảy ra khi lấy user theo email" });
        }
    },
    createUser: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            const lowerEmail = email.toLowerCase();
            if (!name || !lowerEmail || !password || !role)
                return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
            const existUser = await models.User.findOne({
                where: { email: lowerEmail }
            });
            if (existUser) return res.status(400).json({ message: `Email ${lowerEmail} đã được sử dụng` });
            const newUser = await models.User.create({
                name: name,
                email: lowerEmail,
                password: password,
                role: role
            });
            return res.status(200).json({ message: "Đăng ký tài khoản thành công", newUser });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi xảy ra khi tạo tài khoản user" });
        }
    },
    updateUser: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            const userId = req.params.id;
            if (!name || !email || !password || !role || !userId)
                return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
            const existUser = await models.User.findOne({
                where: { id: userId }
            });
            if (!existUser) return res.status(404).json({ message: "Người dùng không tồn tại" });

            const lowerEmail = email.toLowerCase();

            if (lowerEmail !== existUser.email) {
                const existUserEmail = await models.User.findOne({
                    where: { email: lowerEmail }
                });
                if (existUserEmail) return res.status(400).json({ message: `Email ${lowerEmail} đã được sử dụng` });
            }
            existUser.name = name;
            existUser.password = password;
            existUser.email = email;
            existUser.role = role;
            await existUser.save();

            return res.status(200).json({ message: "Đã cập nhật thông tin user thành công", existUser });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Lỗi xảy ra khi cập nhật tài khoản user" });
        }
    }
};
module.exports = User;