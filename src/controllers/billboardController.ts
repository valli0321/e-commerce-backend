import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Billboard from "../models/Billboard";
import Store from "../models/Store";

export const createBillboard = asyncHandler(async( req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { label, imageUrl } = req.body;
    const userId = req.user.userId;

    if(!storeId){
        throw new ApiError(400, "Store Id is required");
    }
    if(!label){
        throw new ApiError(400, "Label is required");
    }
    if(!imageUrl){
        throw new ApiError(400, "Image URL is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const billboard = await Billboard.create({ label, imageUrl, storeId });

    res.status(201).json(new ApiResponse(200, "Billboard created successfully", billboard));
}); 

export const getAllBillboards = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    const billboards = await Billboard.findAll({
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

    res.status(201).json(new ApiResponse(200, "Billboards fetched successfully", billboards));
});

export const getBillboardById = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, billboardId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    if(!billboardId){
        throw new ApiError(400, "Billboard ID is required")
    }

    const billboard = await Billboard.findOne({ where: { id: billboardId, storeId }});

    if(!billboard){
        throw new ApiError(404, "Billboard not found");
    }

    res.status(201).json(new ApiResponse(200, "Billboard fetched successfully", billboard));
});

export const updateBillboard = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, billboardId } = req.params;
    const { label, imageUrl } = req.body;
    const userId = req.user.userId;

    if(!label){
        throw new ApiError(400, "Label is required");
    }

    if(!imageUrl){
        throw new ApiError(400, "Image URL is required");
    }

    if(!billboardId){
        throw new ApiError(400, "Billboard id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const billboard = await Billboard.findOne( { where: { id: billboardId }});
    if(!billboard){
        throw new ApiError(404, "Billboard not found");
    }

    billboard.label = label;
    billboard.imageUrl = imageUrl;

    await billboard.save();

    res.status(200).json(new ApiResponse(201, "Billboard updated successfully", billboard));
    
})

export const deleteBillboard = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, billboardId } = req.params;
    const userId = req.user.userId;

    if(!billboardId){
        throw new ApiError(400, "Billboard id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const billboard = await Billboard.findOne( { where: { id: billboardId }});
    if(!billboard){
        throw new ApiError(404, "Billboard not found");
    }

    await billboard.destroy();

    res.status(200).json(new ApiResponse(201, "Billboard deleted successfully", null));
    
})