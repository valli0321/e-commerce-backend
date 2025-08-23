import { DataTypes, Model, Optional, Op } from "sequelize";
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

    static async generateBillboardId(): Promise<string> {
        const result = await this.max('id', {
            where: {
                id: {
                    [Op.like]: 'bilb_%'
                }
            },
             paranoid: false
        }) as string | null;
        
        const lastNumber = result ? parseInt(result.substring(5), 10) : 0;
        return `bilb_${(lastNumber + 1).toString().padStart(6, '0')}`;
    }

    static associate(models: any){
        this.belongsTo(models.Store, {
            foreignKey: "storeId",
            as: "store"
        });
        this.hasMany(models.Category, {
            foreignKey: "billboardId",
            as: "categories"
        });
    }
}

Billboard.init(
    {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
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
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'stores',
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
        tableName: "Billboards",
        paranoid: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
        hooks: {
            beforeValidate: async (billboard) => {
                if (!billboard.id) {
                    billboard.id = await Billboard.generateBillboardId();
                }
            }
        }
    }
);