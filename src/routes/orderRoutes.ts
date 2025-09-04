import express from "express";

import { getAllOrders, getStoreStats, getMonthluRevenue } from "../controllers/orderController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/:storeId/orders", getAllOrders);
router.get("/:storeId/orders/stats", authMiddleware, getStoreStats);
router.get("/:storeId/orders/graph", authMiddleware, getMonthluRevenue);

export default router;