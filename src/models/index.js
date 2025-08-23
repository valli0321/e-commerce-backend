'use strict';

import fs from "fs";
import path from "path"
import Sequelize from "sequelize"
import process from "process";
import { fileURLToPath, pathToFileURL } from "url";
import sequelize from "../config/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
import configJson from "../config/config.json"
const config = (configJson)[env];

const db = {};

const files = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== path.basename(__filename) &&
    (file.endsWith(".ts") || file.endsWith(".js")) &&
    !file.endsWith(".test.ts") &&
    !file.endsWith(".test.js")
  );
});

for (const file of files) {
  const filePath = path.join(__dirname, file);

    const fileUrl = pathToFileURL(filePath).href;


  const modelModule = await import(fileUrl); 
  const model = modelModule.default || modelModule;

  db[model.name] = model;
}


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

console.log("Registered models:", Object.keys(db));
console.log("Associations:", sequelize.models);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { sequelize };
