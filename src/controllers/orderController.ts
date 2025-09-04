import { Request, Response } from "express";
import { Op,Sequelize } from "sequelize";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Order from "../models/Order";
import Store from "../models/Store";
import OrderItem from "../models/OrderItem";
import Product from "../models/Product";

interface GraphData {
    name: string;
    total: number;
}

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

export const getStoreStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required");
    }

    const paidOrders = await Order.findAll({
        where: { storeId, isPaid: true },
        include: [
            {
                model: OrderItem,
                as: "orderItems",
                include: [
                    {
                        model: Product,
                        as: "product"
                    }
                ]
            }
        ]
    });

    const salesCount = paidOrders?.length;

    const totalRevenue: number = paidOrders?.reduce((total: number, order: any) => {
        const orderTotal = order?.orderItems?.reduce((orderSum: number, item: any) => (
            Number(item?.product?.price) + orderSum
        ), 0);
        return total + orderTotal;
    }, 0);

    const productsInStock = await Product.count({ where: { storeId, isArchived: false }});

    res.status(201).json(new ApiResponse(200, "Stats fetched successfully", {
        totalRevenue,
        salesCount,
        productsInStock
    }))
});

export const getMonthluRevenue = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;

    if(!storeId){
        throw new ApiError(400, "Store ID is required");
    }

    const paidOrders = await Order.findAll({
        where: { storeId, isPaid: true },
        include: [
            {
                model: OrderItem,
                as: "orderItems",
                include: [
                    {
                        model: Product,
                        as: "product"
                    }
                ]
            }
        ]
    });

    const monthlyRevenue: { [key: number]: number } = {};
    
    for(const order of paidOrders){
        const month = (order as any).createdAt.getMonth();
        let revenueForOrder = 0;

        for(const item of (order as any).orderItems){
            revenueForOrder += Number(item.product.price);
        }

        monthlyRevenue[month] = (monthlyRevenue[month] | 0) + revenueForOrder;
    }

    const graphData: GraphData[] = [
        { name: "Jan", total: 0},
        { name: "Feb", total: 0},
        { name: "Mar", total: 0},
        { name: "Apr", total: 0},
        { name: "May", total: 0},
        { name: "Jun", total: 0},
        { name: "Jul", total: 0},
        { name: "Aug", total: 0},
        { name: "Sept", total: 0},
        { name: "Oct", total: 0},
        { name: "Nov", total: 0},
        { name: "Dec", total: 0},
    ];

    for(const month in monthlyRevenue){
        graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
    };

    res.status(201).json(new ApiResponse(200, "Revenue Graph data fetched successfully", graphData));
})