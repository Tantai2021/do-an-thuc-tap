const Upload = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh!" });
    }

    res.status(201).json({
        success: true,
        files: req.files.map(file => {

            return {
                path: `/uploads/${file.fieldname}/${file.filename}`,
                filename: file.filename,
            };
        }),
    });
}
module.exports = Upload;