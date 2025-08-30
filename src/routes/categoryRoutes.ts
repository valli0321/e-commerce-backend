import express from 'express';

import { authMiddleware } from '../middleware/auth';
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from '../controllers/categoryController';

const router = express.Router();

router.post("/:storeId/categories", authMiddleware, createCategory);

//public routes
router.get("/:storeId/categories", getAllCategories);
router.get("/:storeId/categories/:categoryId", getCategoryById)

router.patch("/:storeId/categories/:categoryId", authMiddleware, updateCategory);
router.delete("/:storeId/categories/:categoryId", authMiddleware, deleteCategory);

export default router;