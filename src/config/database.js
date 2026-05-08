require('dotenv').config();

// Railway MySQL puede entregar MYSQL_URL/DATABASE_URL.
// Localmente también se puede usar DB_HOST, DB_USER, DB_PASSWORD y DB_NAME.
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || '';

const databaseConfig = {
  database: process.env.DB_NAME || 'petmarket',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  connectionUrl,
};

module.exports = { databaseConfig };
