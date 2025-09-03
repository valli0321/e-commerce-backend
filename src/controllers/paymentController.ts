import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import crypto from "crypto";

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Product from "../models/Product";

export const verifyPayment = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    if(!razorpay_order_id){
        throw new ApiError(400, "razorpay_order_id is required");
    }
    if(!razorpay_payment_id){
        throw new ApiError(400, "razorpay_payment_id is required");
    }
    if(!razorpay_signature){
        throw new ApiError(400, "razorpay_signature is required");
    }
    if(!dbOrderId){
        throw new ApiError(400, "dbOrderId is required");
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(sign.toString())
        .digest("hex");

    if(razorpay_signature !== expectedSign){
        throw new ApiError(400, "Invalid signature, payment verification failed");
    }

    await Order.update(
        { isPaid: true },
        { where: { id: dbOrderId } }     
    );

    const orderItems = await OrderItem.findAll({ where: { orderId: dbOrderId }});
    const productIds = orderItems.map((item) => item?.productId);

    await Product.update(
        { isArchived: true },
        { where: { id: productIds }}
    );

    res.status(201).json(new ApiResponse(200, "Payment verfied successfully and Order marked as Paid,"));
})

// export const handleWebHook = asyncHandler(async(req: Request, res: Response): Promise<void> => {

// })