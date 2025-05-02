const express = require('express');
const router = express.Router();
const PaymentTransaction = require("../controllers/PaymentTransaction");
const Authentication = require("../middleware/Authenticate");
const Authorization = require("../middleware/Authorize");

router.post('/create', Authentication, Authorization(["admin", "accounting"]), PaymentTransaction.createTransaction);
router.post('/zalopay', PaymentTransaction.zalopayTransaction);
router.post('/zalopay/callback', PaymentTransaction.zalopayTransactionCallback);

module.exports = router;