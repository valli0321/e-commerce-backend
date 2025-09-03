import { DataTypes, Model, Optional, Op } from "sequelize";
import sequelize from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface OrderAttributes {
    id: string;
    storeId: string;
    order_number: string;
    isPaid: boolean;
    phone: string;
    address: string;
    deletedAt?: Date | null;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "id"> {}

export default class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    public id!: string;
    public storeId!: string;
    public isPaid!: boolean;
    public order_number!: string;
    public phone!: string;
    public address!: string;
    public deletedAt?: Date | null;

    static async generateOrderNumber(): Promise<string> {
        const result = await this.max('order_number', {
            where: {
                order_number: {
                    [Op.like]: 'ORD%'
                }
            },
             paranoid: false
        }) as string | null;
        
        const lastNumber = result ? parseInt(result.substring(3), 10) : 0;
        return `ORD${(lastNumber + 1).toString().padStart(4, '0')}`;
    }

    static associate(models: any){
        this.belongsTo(models.Store, {
            foreignKey: "storeId",
            as: "store"
        });
        this.hasMany(models.OrderItem, {
            foreignKey: "orderId",
            as: "orderItems"
        });
    }
}

Order.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            primaryKey: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        storeId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'stores',
                key: 'id',
            },
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        order_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: "Orders",
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        paranoid: true,
        indexes: [
            {
                fields: ["storeId"],
            },
        ],
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
        hooks: {
            beforeCreate: async (order) => {
                if (!order.order_number) {
                    order.order_number = await Order.generateOrderNumber();
                }
            }
        }
    }
);