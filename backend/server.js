// backend/src/server.js
require('dotenv').config();
const express = require('express');
const sequelize = require('./src/db/database'); // Kết nối với cơ sở dữ liệu
const Router = require('./src/routes/index');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 6000;

// Middleware để xử lý dữ liệu
app.use(express.json());
app.use(cors());
// Khởi tạo multer để xử lý form-data
const upload = multer();
// Cấu hình multer trước khi xử lý API
app.use(upload.none());
// Sử dụng các API routes
Router(app);

// Khởi tạo server và kết nối với cơ sở dữ liệu
sequelize.sync({ force: false })
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error);
    });
