import express from 'express';

import { authMiddleware } from '../middleware/auth';
import { createColor, deleteColor, getAllColors, getColorById, updateColor } from '../controllers/colorController';

const router = express.Router();

router.post("/:storeId/colors", authMiddleware, createColor);

//public route
router.get("/:storeId/colors", getAllColors);
router.get("/:storeId/colors/:colorId", getColorById)

router.patch("/:storeId/colors/:colorId", authMiddleware, updateColor);
router.delete("/:storeId/colors/:colorId", authMiddleware, deleteColor);

export default router;