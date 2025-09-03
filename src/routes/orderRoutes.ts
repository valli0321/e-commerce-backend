import express from "express";

import { getAllOrders } from "../controllers/orderController";

const router = express.Router();

router.get("/:storeId/orders", getAllOrders);

export default router;