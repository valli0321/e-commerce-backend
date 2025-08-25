import { DataTypes, Model, Optional, Op } from "sequelize";
import sequelize from "../config/db";

interface ColorAttributes {
    id: string;
    name: string;
    value: string;
    storeId: string;
    deletedAt?: Date | null;
}

interface ColorCreationAttributes extends Optional<ColorAttributes, 'id'> {}

export default class Color extends Model<ColorAttributes, ColorCreationAttributes> implements ColorAttributes {
    public id!: string;
    public name!: string;
    public value!: string;
    public storeId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static associate(models: any){
        this.belongsTo(models.Store, {
            foreignKey: "storeId",
            as: "store"
        });
        this.belongsTo(models.Product, {
            foreignKey: "productId",
            as: "product"
        });
    }
    
}

Color.init( 
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        storeId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: "stores",
                key: "id"
            }
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        paranoid: true,
        timestamps: true,
        tableName: "colors",
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
  }
);