// backend/src/server.js
require('dotenv').config();
const express = require('express');
const sequelize = require('./src/db/database'); // Kết nối với cơ sở dữ liệu
const Router = require('./src/routes/index');
const cors = require('cors');
const app = express();
const path = require("path");
const port = process.env.PORT || 6000;

// Middleware để xử lý dữ liệu
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
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
