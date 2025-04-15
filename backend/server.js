// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require("path");
const http = require('http');
const socketIo = require('socket.io');
const sequelize = require('./src/db/database'); // Kết nối với cơ sở dữ liệu
const Router = require('./src/routes/index');

const port = process.env.PORT || 6000;
const app = express();

// Khởi tạo server HTTP
const server = http.createServer(app);
// Khởi tạo socket.io
const io = socketIo(server, {
    cors: {
        origin: '*', // Chỉnh sửa theo domain của bạn nếu cần
    },
});

// 💡 Gọi file xử lý socket và truyền io vào
require('./src/socket')(io);
app.use((req, res, next) => {
    req.io = io;
    next();
});
// Middleware để xử lý dữ liệu
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// Sử dụng các API routes
Router(app);



// Khởi tạo và đồng bộ hóa cơ sở dữ liệu trước khi bắt đầu server
sequelize.sync({ force: false })
    .then(() => {
        server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error);
    });

    