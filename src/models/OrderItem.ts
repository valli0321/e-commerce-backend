import { DataTypes, Model, Optional, Op } from "sequelize";
import sequelize from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface OrderItemAttributes {
    id: string;
    orderId: string;
    productId: string;
    deletedAt?: Date | null;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, "id"> {}

export default class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    public id!: string;
    public productId!: string;
    public orderId!: string;
    public deletedAt?: Date | null;

    static associate(models: any){
        this.belongsTo(models.Order, {
            foreignKey: "orderId",
            as: "order"
        });
        this.belongsTo(models.Product, {
            foreignKey: "productId",
            as: "product"
        });
    }
}

OrderItem.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            primaryKey: true,
            allowNull: false
        },
        productId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id',
            },
        },
        orderId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'Orders',
                key: 'id',
            },
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: "OrderItems",
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        paranoid: true,
        indexes: [
            {
                fields: ["orderId", "productId"],
            },
        ],
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
    }
);