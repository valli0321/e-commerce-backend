import express from 'express';

import { authMiddleware } from '../middleware/auth';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController';

const router = express.Router();

router.post("/:storeId/products", authMiddleware, createProduct);

// public routes
router.get("/:storeId/products", getAllProducts);
router.get("/:storeId/products/:productId", getProductById)

router.patch("/:storeId/products/:productId", authMiddleware, updateProduct);
router.delete("/:storeId/products/:productId", authMiddleware, deleteProduct);

export default router;