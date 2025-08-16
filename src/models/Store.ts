import { DataTypes, Model, Optional, Op } from "sequelize";
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

    static async generateStoreId(): Promise<string> {
            const result = await this.max('id', {
                where: {
                    id: {
                        [Op.like]: 'STORE%'
                    }
                }
            }) as string | null;
            
            const lastNumber = result ? parseInt(result.substring(5), 8) : 0;
            return `STORE${(lastNumber + 1).toString().padStart(3, '0')}`;
        }

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
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
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
        hooks: {
            beforeValidate: async (store) => {
                if (!store.id) {
                    store.id = await Store.generateStoreId();
                }
            }
        }
  }
);

