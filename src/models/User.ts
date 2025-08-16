import {
    DataTypes,
    Model,
    Optional,
    Sequelize
  } from "sequelize";
  import sequelize from "../config/db";
  import { v4 as uuidv4 } from "uuid";
  import bcrypt from "bcrypt";
  import jwt from "jsonwebtoken"
  
  // Interface for attributes
  export interface UserAttributes {
    userId: string;
    username: string;
    email: string;
    password: string;
    refreshToken?: string | null;
    deletedAt?: Date | null;
  }  

  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;

  const getEnv = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
      }
      return defaultValue;
    }
    return value;
  };
  
  // Then define your token configuration
  const JWT_CONFIG = {
    access: {
      secret: getEnv('ACCESS_TOKEN_SECRET', 'fallback_access_secret'),
      expiresIn: getEnv('ACCESS_TOKEN_EXPIRY', '15m')
    },
    refresh: {
      secret: getEnv('REFRESH_TOKEN_SECRET', 'fallback_refresh_secret'),
      expiresIn: getEnv('REFRESH_TOKEN_EXPIRY', '7d')
    }
  };
  
  // Interface for creation (userId is optional)
  interface UserCreationAttributes extends Optional<UserAttributes, "userId" | "refreshToken" | "deletedAt"> {}
  
  // Model class
  class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public userId!: string;
    public username!: string;
    public email!: string;
    public password!: string;
    public refreshToken!: string | null;
    public deletedAt!: Date | null;
  
    // timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // compare password helper
    public async comparePassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.password);
    }


    

    public generateAccessToken(): string {
        const payload = { userId: this.userId, username: this.username, email: this.email };
        return jwt.sign(
          payload,
          JWT_CONFIG.access.secret!,
          {
            expiresIn: JWT_CONFIG.access.expiresIn as string
          },
      )
    }

    public generateRefreshToken =  (): string => {
      const payload = { userId: this.userId };
      return jwt.sign(
          payload,
          JWT_CONFIG.refresh.secret,
          { 
            expiresIn: JWT_CONFIG.refresh.expiresIn as string
          }
    )
    }

  }
  
  // Init model
  User.init(
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "Users",
      modelName: "User",
      timestamps: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] }
      },
      hooks: {
        beforeCreate: async (user: User) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user: User) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
  
  export default User;
  