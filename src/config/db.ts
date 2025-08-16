import { Sequelize, SequelizeScopeError } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "admin@123",
    database: process.env.DB_NAME || "ecommerce-admin",
    logging: false,
});

export default sequelize;