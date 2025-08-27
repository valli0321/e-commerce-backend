import { DataTypes, Model, Optional, Op } from "sequelize";
import sequelize from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface ImageAttributes {
    id: string;
    url: string;
    productId: string;
    deletedAt?: Date | null;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, "id"> {}

export default class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
    public id!: string;
    public url!: string;
    public productId!: string;

    static associate(models: any){
        this.belongsTo(models.Product, {
            foreignKey: "productId",
            as: "product",
            onDelete: "CASCADE",
        });
    }
}

Image.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            primaryKey: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        productId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id',
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: "Images",
        paranoid: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        indexes: [
            {
                fields: ["productId"],
            },
            ],
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
    }
);