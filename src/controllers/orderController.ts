import { Request, Response } from "express";
import { Op,Sequelize } from "sequelize";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Order from "../models/Order";
import Store from "../models/Store";
import OrderItem from "../models/OrderItem";
import Product from "../models/Product";

export const getAllOrders = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { search } = req.query

    if(!storeId){
        throw new ApiError(400, "Store ID is required")
    }

    const filters: any = {
        storeId,
    };

    if (search && typeof search === "string") {
        filters[Op.and] = Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("Order.order_number")),
            {
                [Op.like]: `%${search.trim().toLowerCase()}%`
            }
        );
    }

    const orders = await Order.findAll({
        where: filters,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: Store,
                as: "store",
                attributes: ["id", "name"]
            },
            {
                model: OrderItem,
                as: "orderItems",
                include: [
                    {
                        model: Product,
                        as: "product"
                    },
                ],
            },
        ]
    });

    res.status(201).json(new ApiResponse(200, "Orders fetched successfully", orders));
});