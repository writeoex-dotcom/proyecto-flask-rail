require('dotenv').config();

const databaseConfig = {
  database: process.env.DB_NAME || 'petmarket',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
};

module.exports = { databaseConfig };
