import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface StoreAttributes {
    id: string;
    name: string;
    userId: string;
    deletedAt?: Date | null;
}

interface StoreCreationAttributes extends Optional<StoreAttributes, 'id'> {}

export default class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
    public id!: string;
    public name!: string;
    public userId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static associate(models: any){
        this.hasMany(models.Billboard, {
            foreignKey: "storeId",
            as: "billboards"
        });
    }
}

Store.init( 
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
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
        paranoid: true,
        timestamps: true,
        tableName: "Stores",
        defaultScope: {
        attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] },
        },
  }
);

