const express = require('express');
const CategoryController = require("../controllers/Category");

const router = express.Router();


router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategoryById);

router.post('/', CategoryController.addCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.softDeleteCategory);
router.patch('/:id', CategoryController.restoreCategory);

module.exports = router;