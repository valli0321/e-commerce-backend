import express from "express";

import { authMiddleware } from "../middleware/auth";
import { registerUser, loginUser, logoutUser, updateUser, forgotPassword, verifyUser, refreshAccessToken } from "../controllers/authController";

const router = express.Router();

router.get("/verify", verifyUser); 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

router.post("/logout", authMiddleware, logoutUser);
router.put("/update", authMiddleware, updateUser);
router.put("/forgot-password", authMiddleware, forgotPassword);


export default router