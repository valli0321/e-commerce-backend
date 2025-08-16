import express from 'express';

import { authMiddleware } from '../middleware/auth';
import { createBillboard, deleteBillboard, getAllBillboards, getBillboardById, updateBillboard } from '../controllers/billboardController';

const router = express.Router();

router.post("/:storeId/billboards", authMiddleware, createBillboard);

router.get("/:storeId/billboards", authMiddleware, getAllBillboards);
router.get("/billboardById/:billboardId", authMiddleware, getBillboardById)

router.patch("/:storeId/billboards/:billboardId", authMiddleware, updateBillboard);
router.delete("/:storeId/billboards/:billboardId", authMiddleware, deleteBillboard);

export default router;