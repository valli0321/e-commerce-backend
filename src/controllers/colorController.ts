import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Billboard from "../models/Billboard";
import Store from "../models/Store";
import Color from "../models/Color";

export const createColor = asyncHandler(async( req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { name, value } = req.body;
    const userId = req.user.userId;

    if(!storeId){
        throw new ApiError(400, "Store Id is required");
    }
    if(!name){
        throw new ApiError(400, "Name is required");
    }
    if(!value){
        throw new ApiError(400, "value is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const color = await Color.create({ name, value, storeId });

    res.status(201).json(new ApiResponse(200, "Color created successfully", color));
}); 

export const getAllColors = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    const colors = await Color.findAll({
        where: { storeId },
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: Store,
                as: "store",
                attributes: ["id", "name"]
            }
        ]
    });

    res.status(201).json(new ApiResponse(200, "Colors fetched successfully", colors));
});

export const getColorById = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { colorId } = req.params;

    if(!colorId){
        throw new ApiError(400, "Color ID is required")
    }

    const color = await Color.findOne({ 
        where: { id: colorId },
        include: [
            {
                model: Store,
                as: "store",
                attributes: ["id", "name"]
            }
        ]
    });

    if(!color){
        throw new ApiError(404, "Color not found");
    }

    res.status(201).json(new ApiResponse(200, "Color fetched successfully", color));
});

export const updateColor = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, colorId } = req.params;
    const { name, value } = req.body;
    const userId = req.user.userId;

    if(!name){
        throw new ApiError(400, "Name is required");
    }

    if(!value){
        throw new ApiError(400, "value is required");
    }

    if(!colorId){
        throw new ApiError(400, "Color id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const color = await Color.findOne( { where: { id: colorId }});
    console.log(color)
    if(!color){
        throw new ApiError(404, "Color not found");
    }

    color.name = name;
    color.value = value;

    await color.save();

    res.status(200).json(new ApiResponse(201, "Color updated successfully", color));
    
})

export const deleteColor = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, colorId } = req.params;
    const userId = req.user.userId;

    if(!colorId){
        throw new ApiError(400, "Color id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const color = await Color.findOne( { where: { id: colorId }});
    if(!color){
        throw new ApiError(404, "Color not found");
    }

    await color.destroy();

    res.status(200).json(new ApiResponse(201, "Color deleted successfully", null));
})