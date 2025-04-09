const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Xác định thư mục con dựa trên loại file
const getUploadPath = (mimetype) => {
    if (mimetype.startsWith("image/")) return "uploads/images/";
    if (mimetype.startsWith("video/")) return "uploads/videos/";
    if (mimetype.startsWith("application/")) return "uploads/documents/";
    return "uploads/others/";
};

// Cấu hình Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../public", getUploadPath(file.mimetype));

        // Kiểm tra và tạo thư mục nếu chưa tồn tại
        fs.mkdirSync(uploadDir, { recursive: true });

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
