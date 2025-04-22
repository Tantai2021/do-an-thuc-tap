const express = require('express');
const StaffController = require("../controllers/Staff");
const router = express.Router();

router.get("/search", StaffController.searchStaff);

module.exports = router;