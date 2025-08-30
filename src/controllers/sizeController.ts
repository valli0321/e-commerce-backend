import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Store from "../models/Store";
import Size from "../models/Size";

export const createSize = asyncHandler(async( req: Request, res: Response): Promise<void> => {
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

    const size = await Size.create({ name, value, storeId });

    res.status(201).json(new ApiResponse(200, "Size created successfully", size));
}); 

export const getAllSizes = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    const sizes = await Size.findAll({
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

    res.status(201).json(new ApiResponse(200, "Sizes fetched successfully", sizes));
});

export const getSizeById = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, sizeId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    if(!sizeId){
        throw new ApiError(400, "Size ID is required")
    }

    const size = await Size.findOne({ 
        where: { id: sizeId, storeId },
        include: [
            {
                model: Store,
                as: "store",
                attributes: ["id", "name"]
            }
        ]
    });

    if(!size){
        throw new ApiError(404, "Size not found");
    }

    res.status(201).json(new ApiResponse(200, "Size fetched successfully", size));
});

export const updateSize = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, sizeId } = req.params;
    const { name, value } = req.body;
    const userId = req.user.userId;

    if(!name){
        throw new ApiError(400, "Name is required");
    }

    if(!value){
        throw new ApiError(400, "value is required");
    }

    if(!sizeId){
        throw new ApiError(400, "Size id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const size = await Size.findOne( { where: { id: sizeId }});
    if(!size){
        throw new ApiError(404, "Size not found");
    }

    size.name = name;
    size.value = value;

    await size.save();

    res.status(200).json(new ApiResponse(201, "Size updated successfully", size));
    
})

export const deleteSize = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, sizeId } = req.params;
    const userId = req.user.userId;

    if(!sizeId){
        throw new ApiError(400, "Size id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const size = await Size.findOne( { where: { id: sizeId }});
    if(!size){
        throw new ApiError(404, "Size not found");
    }

    await size.destroy();

    res.status(200).json(new ApiResponse(201, "Size deleted successfully", null));
    
})