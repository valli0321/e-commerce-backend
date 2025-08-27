import { DataTypes, Model, Optional, Op } from "sequelize";
import sequelize from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface ProductAttributes {
    id: string;
    name: string;
    price: number;
    isFeatured: boolean;
    isArchived: boolean;
    categoryId: string;
    storeId: string;
    sizeId: string;
    colorId: string;
    deletedAt?: Date | null;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id"> {}

export default class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: string;
    public name!: string;
    public price!: number;
    public isFeatured!: boolean;
    public isArchived!: boolean;
    public categoryId!: string;
    public storeId!: string;
    public sizeId!: string;
    public colorId!: string;

    static async generateProductId(): Promise<string> {
        const result = await this.max('id', {
            where: {
                id: {
                    [Op.like]: 'prod_%'
                }
            },
             paranoid: false
        }) as string | null;
        
        const lastNumber = result ? parseInt(result.substring(5), 10) : 0;
        return `prod_${(lastNumber + 1).toString().padStart(6, '0')}`;
    }

    static associate(models: any){
        this.belongsTo(models.Store, {
            foreignKey: "storeId",
            as: "store"
        });
        this.belongsTo(models.Category, {
            foreignKey: "categoryId",
            as: "category"
        });
        this.belongsTo(models.Size, {
            foreignKey: "sizeId",
            as: "size"
        });
        this.belongsTo(models.Color, {
            foreignKey: "colorId",
            as: "color",
        });
        this.hasMany(models.Image, {
            foreignKey: "productId",
            as: "images",
        });
    }
}

Product.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        isArchived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        storeId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'stores',
                key: 'id',
            },
        },
        sizeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sizes',
                key: 'id',
            },
        },
        colorId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'colors',
                key: 'id',
            },
        },
        categoryId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'Categories',
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
        tableName: "Products",
        paranoid: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        indexes: [
            {
                fields: ["storeId", "categoryId", "colorId", "sizeId"],
            },
        ],
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
        hooks: {
            beforeValidate: async (product) => {
                if (!product.id) {
                    product.id = await Product.generateProductId();
                }
            }
        }
    }
);