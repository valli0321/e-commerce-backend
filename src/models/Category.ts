import { DataTypes, Model, Optional, Op } from "sequelize";
import sequelize from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface CategoryAttributes {
    id: string;
    storeId: string;
    name: string;
    billboardId: string;
    deletedAt?: Date | null;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, "id"> {}

export default class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    public id!: string;
    public name!: string;
    public billboardId!: string;
    public storeId!: string;
    public deletedAt?: Date | null;

    static async generateCategoryId(): Promise<string> {
        const result = await this.max('id', {
            where: {
                id: {
                    [Op.like]: 'catg_%'
                }
            },
             paranoid: false
        }) as string | null;
        
        const lastNumber = result ? parseInt(result.substring(5), 10) : 0;
        return `catg_${(lastNumber + 1).toString().padStart(6, '0')}`;
    }

    static associate(models: any){
        this.belongsTo(models.Store, {
            foreignKey: "storeId",
            as: "store"
        });
        
        this.belongsTo(models.Billboard, {
            foreignKey: "billboardId",
            as: "billboard"
        });
    }
}

Category.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        name: {
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
        billboardId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            references: {
                model: 'Billboards',
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
        tableName: "Categories",
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt"] },
        },
        hooks: {
            beforeValidate: async (category) => {
                if (!category.id) {
                    category.id = await Category.generateCategoryId();
                }
            }
        }
    }
);