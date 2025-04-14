const express = require('express');
const CustomerController = require("../controllers/Customer");
const router = express.Router();

router.get("/search", CustomerController.findCustomers);

module.exports = router;