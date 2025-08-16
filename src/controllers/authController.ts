import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User, { UserAttributes } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

interface JwtPayloadCustom extends jwt.JwtPayload {
  userId: string;
  username: string;
  email: string;
}

const generateAccessandRefreshTokens = async (user: any) => {
    try {
        // const user = await User.findByPk(userId);
        const accessToken = user?.generateAccessToken();
        const refreshToken = user?.generateRefreshToken();

        user.refreshToken = refreshToken ?? null;
        await user?.save({ fields: ["refreshToken"]});

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

export const registerUser = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const {username, email, password} = req.body;

    if([username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields required");
    }

    const alreadyExists = await User.findOne({where: {email: email}});
    if(alreadyExists){
        throw new ApiError(400, "Email already exits");
    }

    const newuser = await User.create({ username, email, password});

    const createdUser = await User.findByPk(newuser.userId, {
        attributes: ["email", "username"]
    })

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating registering User");
    }

    res.status(201).json(new ApiResponse(200, "User registered successfully", createdUser));
});

export const loginUser = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if(!email && !password){
        throw new ApiError(400, "Email and password required");
    }

    const user = await User.findOne({ where: { email: email}});

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid){
        throw new ApiError(404, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user);

    const loggedInUser = await User.findByPk(user.userId, {
        attributes: ["email", "username"]
    })

    const options = {
        httpOnly: true,
        secure: true
    };

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User logged in successfully", {user : loggedInUser, accessToken, refreshToken}));
})

export const logoutUser = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    if(!user?.refreshToken){
        const options = {
            httpOnly: true,
            secure: true
        }
    
        res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, "User was already logged out", {}));
    }

    await User.update({refreshToken: null}, {where: {userId: userId}});

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfullly", {}));
})

export const updateUser = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { username } = req.body;
    const user = req.user;

    if(!username){
        throw new ApiError(400, "Username required");
    }

    if(!user){
        throw new ApiError(400, "User does not exist");
    }

    user.username = username;
    await user.save();

    res.status(200).json(new ApiResponse(200, "User updated successfully", user));
})

export const forgotPassword = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const {currentPassword, newPassword} = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    if(!currentPassword || !newPassword){
        throw new ApiError(400, "Old Password and New Password required");
    }

    const isPasswordValid = await user?.comparePassword(currentPassword);
    if(!isPasswordValid){
        throw new ApiError(401, "Wrong Password");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(new ApiResponse(200, "Password updated successfully", user));

})

export const verifyUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization");
    
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(accessToken?.replace("Bearer ", ""), process.env.ACCESS_TOKEN_SECRET!) as JwtPayloadCustom;
        const user = await User.findByPk(decodedToken.userId, {
            attributes: ['username', 'email']
        });

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        res.status(200).json(new ApiResponse(200, "User verified", user));
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayloadCustom;

        const user = await User.findByPk(decodedToken.userId);

        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user);

        const options = {
            httpOnly: true,
            secure: true
        };

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(
                200,
                "Access token refreshed",
                { accessToken, refreshToken }
            ));
    } catch (error: any) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});