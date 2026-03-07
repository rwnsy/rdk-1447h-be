const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// CREATE a new category
router.post("/categories", categoryController.createCategory);

// GET all categories
router.get("/categories", categoryController.getAllCategories);

// GET a single category by ID
router.get("/categories/:id", categoryController.getCategoryById);

// UPDATE a category by ID
router.put("/categories/:id", categoryController.updateCategory);

// DELETE a category by ID
router.delete("/categories/:id", categoryController.deleteCategory);

module.exports = router;