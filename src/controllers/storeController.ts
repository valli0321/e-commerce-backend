
import { Request, Response } from "express";

import Store from "../models/Store";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createStore = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    const userId = req.user.userId;
    
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!name) {
      throw new ApiError(400, "Store Name is required");
    }

    const newStore = await Store.create({
      name,
      userId: userId,
    });

    res.status(201).json(new ApiResponse(200, "Store created successfully", newStore));

});

export const getFirstStore = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.userId;
    if(!userId){
      throw new ApiError(401, "User not authenticated.");
    }
    
    const firstStore = await Store.findOne({
      where: { userId },
      order: [["createdAt", "ASC"]],
      attributes: ["id", "name"]
    })
    
    if(!firstStore){
      throw new ApiError(404, "No store found for this user");
    }

    res.status(201).json(new ApiResponse(200, "", firstStore));
    
});

export const getStoreById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    const store = await Store.findOne({ where: { id: storeId }, attributes: {exclude: ["userId"]}});

    if(!store){
      throw new ApiError(404, "Store not found");
    }

    res.status(200).json(new ApiResponse(200, "Store fetched successfully", store))

})

export const getAllStores = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.userId;

    if(!userId){
      throw new ApiError(401, "User not authenticated.");
    }

    const stores = await Store.findAll({ where: { userId: userId }, });

    res.status(200).json(new ApiResponse(201, "Stores fetched successfully", stores));

})

export const updateStore = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.userId;

    if(!userId){
      throw new ApiError(404, "User not authenticated.");
    }

    const { name } = req.body;
    const { storeId } = req.params;

    if(!name){
      throw new ApiError(400, "Name is required");
    }

    if(!storeId){
      throw new ApiError(400, "Store ID is required");
    }

    const store: any = await Store.findOne({ where: { id: storeId }});

    if(!store){
      throw new ApiError(404, "Store not found.");
    }

    store.name = name;
    await store.save();

    res.status(200).json(new ApiResponse(201, "Store updated successfully", store));
})

export const deleteStore = asyncHandler(async (req: Request, res: Response): Promise<void> => {

    const userId = req.user.userId;

    if(!userId){
      throw new ApiError(404, "User not authenticated.");
    }

    const { storeId } = req.params;

    if(!storeId){
      throw new ApiError(400, "Store ID is required");
    }

    const store: any = await Store.findOne({ where: { id: storeId }});

    if(!store){
      throw new ApiError(404, "Store not found.");
    }

    await store.destroy();

    res.status(200).json(new ApiResponse(201, "Store deleted successfully", null));

})