require('dotenv').config();

// Railway MySQL puede exponer MYSQL_URL/DATABASE_URL o variables separadas
// como MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD y MYSQLDATABASE.
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || '';
const sslEnabled = process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true';

const databaseConfig = {
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'petmarket',
  username: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'password',
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  connectionUrl,
  retryAttempts: Number(process.env.DB_CONNECT_RETRIES || 15),
  retryDelayMs: Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 5000),
  dialectOptions: sslEnabled ? { ssl: { require: true, rejectUnauthorized: false } } : {},
};

module.exports = { databaseConfig };
