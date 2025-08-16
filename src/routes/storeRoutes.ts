import express from 'express';

import { authMiddleware } from '../middleware/auth';
import { createStore, deleteStore, getAllStores, getFirstStore, getStoreById, updateStore } from '../controllers/storeController';

const router = express.Router();

router.post("/create-store", authMiddleware, createStore);

router.get("/first-store", authMiddleware, getFirstStore);
router.get("/:storeId", authMiddleware, getStoreById);
router.get("/", authMiddleware, getAllStores)

router.put("/:storeId", authMiddleware, updateStore);
router.delete("/:storeId", authMiddleware, deleteStore);


export default router;