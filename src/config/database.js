require('dotenv').config();

// Railway/Render MySQL can be provided as a full URL or as separate variables.
// Railway's recommended setup is a Variable Reference in the WEB service:
// MYSQL_URL=${{MySQL.MYSQL_URL}}
const urlVariableNames = [
  'MYSQL_URL',
  'MYSQL_PUBLIC_URL',
  'DATABASE_URL',
  'DATABASE_PUBLIC_URL',
  'DB_URL',
];

const separateVariableNames = [
  'MYSQLHOST',
  'MYSQLPORT',
  'MYSQLDATABASE',
  'MYSQL_DATABASE',
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQL_ROOT_PASSWORD',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
];

function cleanEnvValue(value) {
  if (!value) return '';
  const cleaned = String(value).trim().replace(/^['"]|['"]$/g, '');
  // Detect unresolved platform template references so they do not get treated as URLs.
  if (cleaned.startsWith('${{') || cleaned.includes('undefined')) return '';
  return cleaned;
}

function firstPresent(names) {
  const name = names.find((key) => Boolean(cleanEnvValue(process.env[key])));
  return [name || '', name ? cleanEnvValue(process.env[name]) : ''];
}

const [connectionUrlSource, connectionUrl] = firstPresent(urlVariableNames);
const sslEnabled = process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true';
const database = cleanEnvValue(process.env.DB_NAME) || cleanEnvValue(process.env.MYSQLDATABASE) || cleanEnvValue(process.env.MYSQL_DATABASE) || 'petmarket';
const username = cleanEnvValue(process.env.DB_USER) || cleanEnvValue(process.env.MYSQLUSER) || 'root';
const password = cleanEnvValue(process.env.DB_PASSWORD) || cleanEnvValue(process.env.MYSQLPASSWORD) || cleanEnvValue(process.env.MYSQL_ROOT_PASSWORD) || 'password';
const host = cleanEnvValue(process.env.DB_HOST) || cleanEnvValue(process.env.MYSQLHOST) || 'localhost';
const port = Number(cleanEnvValue(process.env.DB_PORT) || cleanEnvValue(process.env.MYSQLPORT) || 3306);
const explicitSeparateConfig = separateVariableNames.some((key) => Boolean(cleanEnvValue(process.env[key])));
const hasExplicitDatabaseConfig = Boolean(connectionUrl || explicitSeparateConfig);
const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT
  || process.env.RAILWAY_ENVIRONMENT_NAME
  || process.env.RAILWAY_PROJECT_ID
  || process.env.RAILWAY_SERVICE_ID,
);
const isRender = Boolean(
  process.env.RENDER
  || process.env.RENDER_SERVICE_ID
  || process.env.RENDER_EXTERNAL_HOSTNAME
  || process.env.RENDER_INSTANCE_ID,
);
const hostedPlatform = isRailway ? 'Railway' : (isRender ? 'Render' : null);

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

function listPresentKeys(names) {
  return names.filter((key) => Boolean(cleanEnvValue(process.env[key])));
}

const missingHostedConfigMessage = hostedPlatform === 'Railway'
  ? 'No se detectaron variables MySQL en el servicio web. En Railway agrega una Variable Reference como MYSQL_URL=${{MySQL.MYSQL_URL}} o MYSQL_PUBLIC_URL=${{MySQL.MYSQL_PUBLIC_URL}} dentro del servicio web.'
  : 'No se detectaron variables MySQL en el servicio web. En Render agrega MYSQL_URL con la URL de tu MySQL externo en Environment Variables o al crear el Blueprint.';

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
  isRender,
  hostedPlatform,
  missingHostedConfigMessage,
  retryAttempts: Number(process.env.DB_CONNECT_RETRIES || 0),
  retryDelayMs: Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 5000),
  dialectOptions: sslEnabled ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  summary: {
    usingUrl: Boolean(connectionUrl),
    urlSource: connectionUrlSource || null,
    presentUrlKeys: listPresentKeys(urlVariableNames),
    presentSeparateKeys: listPresentKeys(separateVariableNames),
    hasExplicitDatabaseConfig,
    isRailway,
    isRender,
    hostedPlatform,
    sanitizedUrl: sanitizeUrl(connectionUrl),
    host,
    port,
    database,
    username,
    help: hostedPlatform && !hasExplicitDatabaseConfig ? missingHostedConfigMessage : null,
  },
};

module.exports = { databaseConfig };
