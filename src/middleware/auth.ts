import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

interface JwtPayloadCustom extends jwt.JwtPayload {
  userId: string;
  username: string;
  email: string;
}


export const authMiddleware = asyncHandler(async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = req.cookies?.accessToken || req.header("Authorization");  
    
    if(!accessToken){
      throw new ApiError(401, "Unauthorized - Malformed token")
    }

    const decoded = jwt.verify(accessToken?.replace("Bearer ", ""), process.env.ACCESS_TOKEN_SECRET!) as JwtPayloadCustom;

    const user = await User.findByPk(decoded.userId, {
      attributes: ["userId", "username", "email", "refreshToken"]
    })

    if(!user){
      throw new ApiError(401, "Invalid Access Token")
    }
    if(!user.refreshToken){
      throw new ApiError(401, "Session expired. Please login again")
    }

    req.user = user;
    next();
  } catch (error: any) {
    if(error.name === "TokenExpiredError"){
      throw new ApiError(401, "Session expired. Please login again")
    }
    if(error.name === "JsonWebTokenError"){
      throw new ApiError(401, "Invalid token")
    }
    throw error
  }
})
