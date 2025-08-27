import express from 'express';

import { authMiddleware } from '../middleware/auth';
import { createSize, deleteSize, getAllSizes, getSizeById, updateSize } from '../controllers/sizeController';

const router = express.Router();

router.post("/:storeId/sizes", authMiddleware, createSize);

// public route
router.get("/:storeId/sizes", getAllSizes);
router.get("/sizeById/:sizeId", getSizeById)

router.patch("/:storeId/sizes/:sizeId", authMiddleware, updateSize);
router.delete("/:storeId/sizes/:sizeId", authMiddleware, deleteSize);

export default router;