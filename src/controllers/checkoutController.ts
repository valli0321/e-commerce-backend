import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { razorpay } from "../utils/razorpay";

import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Product from "../models/Product";

export const checkout = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { storeId } = req.params;
    const { phone, address, productIds } = req.body;

    if(!storeId){
        throw new ApiError(400, "Store ID is required");
    }
    if(!phone){
        throw new ApiError(400, "Phone is required");
    }
    if(!address){
        throw new ApiError(400, "Address ID is required");
    }
    if(!productIds || !productIds.length){
        throw new ApiError(400, "Product IDs are required");
    }

    const products = await Product.findAll({ 
        where: { 
            id: {
                [Op.in]: productIds
            }
        }
    });

    const order = await Order.create({
        storeId,
        phone,
        address,
        order_number: await Order.generateOrderNumber(),
        isPaid: false,
    });

    productIds?.forEach(async (product: string) => (
        await OrderItem.create({
            orderId: order?.id,
            productId: product,
        })
    ));

    const totalAmount: number | string = products.reduce((total, product) => (
        total + Number(product?.price)
    ), 0);

    const razorpayOrder = await razorpay.orders.create({
        amount: Number(totalAmount * 100), // Amount in paise
        currency: "INR",
        receipt: order.order_number,
        notes: {
            storeId,
            productIds: productIds
        }
    })

    const resOrder = {
        razorpayOrder: {
            ...razorpayOrder
        },
        dbOrder: order
    }

    res.status(201).json(new ApiResponse(200, "Checkout initiated successfully", resOrder));
});