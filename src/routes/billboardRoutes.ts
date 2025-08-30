import express from 'express';

import { authMiddleware } from '../middleware/auth';
import { createBillboard, deleteBillboard, getAllBillboards, getBillboardById, updateBillboard } from '../controllers/billboardController';

const router = express.Router();

router.post("/:storeId/billboards", authMiddleware, createBillboard);

//public route
router.get("/:storeId/billboards", getAllBillboards);
router.get("/:storeId/billboards/:billboardId", getBillboardById)

router.patch("/:storeId/billboards/:billboardId", authMiddleware, updateBillboard);
router.delete("/:storeId/billboards/:billboardId", authMiddleware, deleteBillboard);

export default router;