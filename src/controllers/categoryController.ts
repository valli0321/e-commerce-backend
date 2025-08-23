import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Billboard from "../models/Billboard";
import Category from "../models/Category";
import Store from "../models/Store";

export const createCategory = asyncHandler(async( req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { name, billboardId } = req.body;
    const userId = req.user.userId;

    if(!storeId){
        throw new ApiError(400, "Store Id is required");
    }
    if(!name){
        throw new ApiError(400, "Category is required");
    }
    if(!billboardId){
        throw new ApiError(400, "Billboard Id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const category = await Category.create({ name, billboardId, storeId });

    res.status(201).json(new ApiResponse(200, "Category created successfully", category));
}); 

export const getAllCategories = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    const categories = await Category.findAll({
        where: { storeId },
        include: [
            {
                model: Billboard,
                as: "billboard",
                attributes: ["id", "label"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });

    res.status(201).json(new ApiResponse(200, "Categories fetched successfully", categories));
});

export const getCategoryById = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { categoryId } = req.params;

    if(!categoryId){
        throw new ApiError(400, "Billboard ID is required")
    }

    const category = await Category.findOne({
        where: { id: categoryId },
        include: [
        {
            model: Billboard,
            as: "billboard",
            attributes: ["id", "label", "imageUrl"],
        },
      ],
    });

    if(!category){
        throw new ApiError(404, "Category not found");
    }

    res.status(201).json(new ApiResponse(200, "Category fetched successfully", category));
});

export const updateCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, categoryId } = req.params;
    const { name, billboardId } = req.body;
    const userId = req.user.userId;

    if(!name){
        throw new ApiError(400, "Name is required");
    }

    if(!billboardId){
        throw new ApiError(400, "Billboard id is required");
    }

    if(!categoryId){
        throw new ApiError(400, "Category id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const category = await Category.findOne( { where: { id: categoryId }});
    
    if(!category){
        throw new ApiError(404, "Category not found");
    }

    category.name = name;
    category.billboardId = billboardId;

    await category.save();

    res.status(200).json(new ApiResponse(201, "Category updated successfully", category));
    
})

export const deleteCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, categoryId } = req.params;
    const userId = req.user.userId;

    if(!categoryId){
        throw new ApiError(400, "Category id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const category = await Category.findOne( { where: { id: categoryId }});
    if(!category){
        throw new ApiError(404, "Category not found");
    }

    await category.destroy();

    res.status(200).json(new ApiResponse(201, "Category deleted successfully", null));
    
})