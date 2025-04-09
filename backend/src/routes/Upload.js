const express = require('express');
const router = express.Router();
const upload = require("../config/uploadFile");
const UploadController = require("../controllers/Upload");
router.post("/", upload.array("images"), UploadController);
module.exports = router;