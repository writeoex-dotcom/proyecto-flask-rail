require('dotenv').config();

// Railway MySQL puede exponer MYSQL_URL/DATABASE_URL/MYSQL_PUBLIC_URL
// o variables separadas como MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD y MYSQLDATABASE.
function firstPresent(entries) {
  return entries.find(([, value]) => Boolean(value)) || ['', ''];
}

const [connectionUrlSource, connectionUrl] = firstPresent([
  ['DB_URL', process.env.DB_URL],
  ['MYSQL_URL', process.env.MYSQL_URL],
  ['DATABASE_URL', process.env.DATABASE_URL],
  ['MYSQL_PUBLIC_URL', process.env.MYSQL_PUBLIC_URL],
]);
const sslEnabled = process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true';
const database = process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'petmarket';
const username = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'password';
const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
const explicitSeparateConfig = Boolean(
  process.env.DB_HOST
  || process.env.MYSQLHOST
  || process.env.DB_NAME
  || process.env.MYSQLDATABASE
  || process.env.MYSQL_DATABASE
  || process.env.DB_USER
  || process.env.MYSQLUSER
  || process.env.DB_PASSWORD
  || process.env.MYSQLPASSWORD
  || process.env.MYSQL_ROOT_PASSWORD,
);
const hasExplicitDatabaseConfig = Boolean(connectionUrl || explicitSeparateConfig);
const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT
  || process.env.RAILWAY_ENVIRONMENT_NAME
  || process.env.RAILWAY_PROJECT_ID
  || process.env.RAILWAY_SERVICE_ID,
);

function sanitizeUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.password) url.password = '***';
    return url.toString();
  } catch (error) {
    return 'URL inválida o no parseable';
  }
}

const missingRailwayConfigMessage = 'No se detectaron variables MySQL en el servicio web. En Railway agrega una Variable Reference como MYSQL_URL=${{MySQL.MYSQL_URL}} o MYSQL_PUBLIC_URL=${{MySQL.MYSQL_PUBLIC_URL}} dentro del servicio web.';

const databaseConfig = {
  database,
  username,
  password,
  host,
  port,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  connectionUrl,
  connectionUrlSource,
  hasExplicitDatabaseConfig,
  isRailway,
  missingRailwayConfigMessage,
  retryAttempts: Number(process.env.DB_CONNECT_RETRIES || 0),
  retryDelayMs: Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 5000),
  dialectOptions: sslEnabled ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  summary: {
    usingUrl: Boolean(connectionUrl),
    urlSource: connectionUrlSource || null,
    hasExplicitDatabaseConfig,
    isRailway,
    sanitizedUrl: sanitizeUrl(connectionUrl),
    host,
    port,
    database,
    username,
    help: isRailway && !hasExplicitDatabaseConfig ? missingRailwayConfigMessage : null,
  },
};

module.exports = { databaseConfig };
