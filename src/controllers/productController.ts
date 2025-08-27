import { Request, Response } from "express";
import { Op,Sequelize } from "sequelize";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Product from "../models/Product";
import Store from "../models/Store";
import Color from "../models/Color";
import Category from "../models/Category";
import Size from "../models/Size";
import Image from "../models/Image"

export const createProduct = asyncHandler(async( req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { name, price, images, categoryId, sizeId, colorId, isFeatured, isArchived } = req.body;
    const userId = req.user.userId;

    if(!storeId){
        throw new ApiError(400, "Store Id is required");
    }
    if(!name){
        throw new ApiError(400, "Name is required");
    }
    if(!price){
        throw new ApiError(400, "Name is required");
    }
    if(!categoryId){
        throw new ApiError(400, "Category id is required");
    }
    if(!sizeId){
        throw new ApiError(400, "Size id is required");
    }
    if(!colorId){
        throw new ApiError(400, "Color id is required");
    }
    if(!images || !images.length){
        throw new ApiError(400, "Images are required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const product = await Product.create({ 
        name, 
        price, 
        categoryId, 
        sizeId, 
        colorId, 
        isFeatured, 
        isArchived, 
        storeId,
        images: [
            ...images.map((image: { url: string}) => image)
        ],
    } as any,
    {
        include: [{
            model: Image,
            as: "images"
        }]
    });

    res.status(201).json(new ApiResponse(200, "Product created successfully", product));
}); 

export const getAllProducts = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { search, colorId, sizeId, categoryId, isFeatured } = req.query

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    const filters: any = {
        storeId,
    };

    if (search && typeof search === "string") {
        filters[Op.and] = Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("Product.name")),
            {
                [Op.like]: `%${search.trim().toLowerCase()}%`
            }
    );
}

    if(categoryId){
        filters.categoryId = categoryId;
    }
    if(sizeId){
        filters.sizeId = sizeId;
    }
    if(colorId){
        filters.colorId = colorId;
    }
    if(typeof isFeatured !== "undefined"){
        filters.isFeatured = isFeatured === "true"
    }

    const products = await Product.findAll({
        where: filters,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: Store,
                as: "store",
                attributes: ["id", "name"]
            },
            {
                model: Color,
                as: "color",
                attributes: ["id", "name", "value"]
            },
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"]
            },
            {
                model: Size,
                as: "size",
                attributes: ["id", "name", "value"]
            },
            {
                model: Image,
                as: "images",
            },
        ]
    });

    res.status(201).json(new ApiResponse(200, "Products fetched successfully", products));
});

export const getProductById = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;

    if(!productId){
        throw new ApiError(400, "Product ID is required")
    }

    const product = await Product.findOne({
        where: { id: productId },
        // attributes: ["id", "name", "price"],
        include: [
            {
                model: Store,
                as: "store",
                attributes: ["id", "name"]
            },
            {
                model: Color,
                as: "color",
                attributes: ["id", "name", "value"]
            },
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"]
            },
            {
                model: Size,
                as: "size",
                attributes: ["id", "name", "value"]
            },
            {
                model: Image,
                as: "images",
            },
        ]
    });

    if(!product){
        throw new ApiError(404, "Product not found");
    }

    res.status(201).json(new ApiResponse(200, "Product fetched successfully", product));
});

export const updateProduct = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, productId } = req.params;
    const { name, price, categoryId, colorId, sizeId, isFeatured, isArchived, images } = req.body;
    const userId = req.user.userId;

    if(!productId){
        throw new ApiError(400, "Billboard id is required");
    }

    if(!name){
        throw new ApiError(400, "Name is required");
    }
    if(!price){
        throw new ApiError(400, "Price is required");
    }
    if(!categoryId){
        throw new ApiError(400, "Product id is required");
    }
    if(!colorId){
        throw new ApiError(400, "Color id is required");
    }
    if(!sizeId){
        throw new ApiError(400, "Size id is required");
    }
    if(!images || !images.length){
        throw new ApiError(400, "Images are required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const product = await Product.findOne( { where: { id: productId }});
    if(!product){
        throw new ApiError(404, "Product not found");
    }

    await product.update({
        name,
        price,
        colorId,
        categoryId,
        sizeId,
        isFeatured,
        isArchived
    })

    await Image.destroy({ where: { productId }});

    await Image.bulkCreate(
        images.map((image: {url: string}) => ({
            url: image.url,
            productId: product.id
        }))
    )

    const updatedProduct = await Product.findOne({
        where: { id: productId },
        include: [
            {
                model: Store,
                as: "store",
                attributes: ["id", "name"]
            },
            {
                model: Color,
                as: "color",
                attributes: ["id", "name", "value"]
            },
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"]
            },
            {
                model: Size,
                as: "size",
                attributes: ["id", "name", "value"]
            },
            {
                model: Image,
                as: "images",
            },
        ]
    })

    res.status(200).json(new ApiResponse(201, "Product updated successfully", updatedProduct));
    
})

export const deleteProduct = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId, productId } = req.params;
    const userId = req.user.userId;

    if(!productId){
        throw new ApiError(400, "Product id is required");
    }

    const storeByUserId = await Store.findOne({ where: {id: storeId, userId }});
    if(!storeByUserId){
        throw new ApiError(403, "Unauthorised");
    }

    const product = await Product.findOne( { where: { id: productId }});
    if(!product){
        throw new ApiError(404, "Product not found");
    }

    await product.destroy();

    res.status(200).json(new ApiResponse(201, "Product deleted successfully", null));
    
})