import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface BillboardAttributes {
    id: string;
    storeId: string;
    label: string;
    imageUrl: string;
    deletedAt?: Date | null;
}

interface BillboardCreationAttributes extends Optional<BillboardAttributes, "id"> {}

export default class Billboard extends Model<BillboardAttributes, BillboardCreationAttributes> implements BillboardAttributes {
    public id!: string;
    public label!: string;
    public imageUrl!: string;
    public storeId!: string;

    static associate(models: any){
        this.belongsTo(models.Store, {
            foreignKey: "storeId",
            as: "store"
        });
    }
}

Billboard.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            primaryKey: true,
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        storeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: "Billboards",
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
    }
);