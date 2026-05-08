require('dotenv').config();

const dns = require('dns');

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

function parseMaybeUrl(rawValue) {
  const cleaned = cleanEnvValue(rawValue);
  if (!cleaned || !cleaned.includes('://')) return null;
  try {
    return new URL(cleaned);
  } catch (error) {
    return null;
  }
}

function envOrUrlValue(envName, url, urlProp, fallback = '') {
  const fromEnv = cleanEnvValue(process.env[envName]);
  if (fromEnv) return fromEnv;
  if (!url) return fallback;
  if (urlProp === 'database') return decodeURIComponent(url.pathname.replace(/^\//, '')) || fallback;
  return decodeURIComponent(url[urlProp] || '') || fallback;
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const [rawConnectionUrlSource, rawConnectionUrl] = firstPresent(urlVariableNames);
const mysqlHostAsUrl = parseMaybeUrl(process.env.MYSQLHOST || process.env.DB_HOST);
const connectionUrlSource = rawConnectionUrlSource || (mysqlHostAsUrl ? 'MYSQLHOST' : '');
const connectionUrl = rawConnectionUrl || (mysqlHostAsUrl ? mysqlHostAsUrl.toString() : '');
const parsedConnectionUrl = parseMaybeUrl(connectionUrl);
const sslEnabled = process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true';
const database = envOrUrlValue('MYSQLDATABASE', parsedConnectionUrl, 'database')
  || cleanEnvValue(process.env.MYSQL_DATABASE)
  || cleanEnvValue(process.env.DB_NAME)
  || (cleanEnvValue(process.env.MYSQLHOST) ? 'railway' : 'petmarket');
const username = envOrUrlValue('MYSQLUSER', parsedConnectionUrl, 'username')
  || cleanEnvValue(process.env.DB_USER)
  || 'root';
const password = cleanEnvValue(process.env.MYSQLPASSWORD)
  || cleanEnvValue(process.env.MYSQL_ROOT_PASSWORD)
  || cleanEnvValue(process.env.DB_PASSWORD)
  || envOrUrlValue('', parsedConnectionUrl, 'password')
  || '';
const hostFromEnv = cleanEnvValue(process.env.MYSQLHOST) || cleanEnvValue(process.env.DB_HOST);
const host = parseMaybeUrl(hostFromEnv)?.hostname || hostFromEnv || parsedConnectionUrl?.hostname || 'localhost';
const port = positiveNumber(
  cleanEnvValue(process.env.MYSQLPORT) || cleanEnvValue(process.env.DB_PORT) || parsedConnectionUrl?.port,
  3306,
);

function anyPresent(names) {
  return names.some((key) => Boolean(cleanEnvValue(process.env[key])));
}

function missingKeys(names) {
  return names.filter((key) => !cleanEnvValue(process.env[key]));
}

function missingOneOf(label, names) {
  return names.some((key) => Boolean(cleanEnvValue(process.env[key]))) ? [] : [label];
}

const mysqlSeparateMode = !connectionUrl && anyPresent([
  'MYSQLHOST',
  'MYSQLPORT',
  'MYSQLDATABASE',
  'MYSQL_DATABASE',
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQL_ROOT_PASSWORD',
]);
const dbSeparateMode = !connectionUrl && !mysqlSeparateMode && anyPresent([
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
]);
const missingSeparateKeys = mysqlSeparateMode
  ? [
    ...missingKeys(['MYSQLHOST', 'MYSQLPORT', 'MYSQLUSER']),
    ...(cleanEnvValue(process.env.MYSQLDATABASE) || cleanEnvValue(process.env.MYSQL_DATABASE) ? [] : ['MYSQLDATABASE o MYSQL_DATABASE']),
    ...missingOneOf('MYSQLPASSWORD o MYSQL_ROOT_PASSWORD', ['MYSQLPASSWORD', 'MYSQL_ROOT_PASSWORD']),
  ]
  : (dbSeparateMode ? missingKeys(['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) : []);
const separateConfigMode = connectionUrl ? 'url' : (mysqlSeparateMode ? 'mysql' : (dbSeparateMode ? 'db' : null));

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
const usesRailwayInternalHost = host.endsWith('.railway.internal');

// mysql.railway.internal can resolve only over Railway private networking (IPv6 on
// legacy environments). Prefer IPv6 first for that hostname to avoid clients trying
// an IPv4-only path before the private AAAA record.
const dnsResultOrder = cleanEnvValue(process.env.MYSQL_DNS_RESULT_ORDER)
  || cleanEnvValue(process.env.DB_DNS_RESULT_ORDER)
  || (usesRailwayInternalHost ? 'ipv6first' : 'verbatim');
try {
  if (typeof dns.setDefaultResultOrder === 'function') dns.setDefaultResultOrder(dnsResultOrder);
} catch (error) {
  if (dnsResultOrder !== 'verbatim' && typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('verbatim');
  }
}

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

const railwayInternalHelp = usesRailwayInternalHost
  ? 'MYSQLHOST=mysql.railway.internal usa la red privada de Railway. Debe ejecutarse desde un servicio del mismo proyecto/entorno que MySQL; fuera de Railway usa MYSQL_PUBLIC_URL o DATABASE_PUBLIC_URL.'
  : null;

const incompleteSeparateConfigMessage = missingSeparateKeys.length
  ? `Configuración MySQL incompleta (${separateConfigMode}). Faltan variables: ${missingSeparateKeys.join(', ')}. En Railway usa MYSQL_URL=\${{MySQL.MYSQL_URL}} o define MYSQLHOST=mysql.railway.internal, MYSQLPORT, MYSQLDATABASE, MYSQLUSER y MYSQLPASSWORD en el servicio web.`
  : null;


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
  incompleteSeparateConfigMessage,
  missingSeparateKeys,
  separateConfigMode,
  railwayInternalHelp,
  usesRailwayInternalHost,
  dnsResultOrder: typeof dns.getDefaultResultOrder === 'function' ? dns.getDefaultResultOrder() : dnsResultOrder,
  retryAttempts: Number(process.env.DB_CONNECT_RETRIES || 0),
  retryDelayMs: Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 5000),
  syncAlter: process.env.DB_SYNC_ALTER === 'true',
  connectTimeoutMs: positiveNumber(process.env.DB_CONNECT_TIMEOUT_MS || process.env.MYSQL_CONNECT_TIMEOUT_MS, 20000),
  dialectOptions: {
    connectTimeout: positiveNumber(process.env.DB_CONNECT_TIMEOUT_MS || process.env.MYSQL_CONNECT_TIMEOUT_MS, 20000),
    ...(sslEnabled ? { ssl: { require: true, rejectUnauthorized: false } } : {}),
  },
  summary: {
    usingUrl: Boolean(connectionUrl),
    urlSource: connectionUrlSource || null,
    presentUrlKeys: listPresentKeys(urlVariableNames),
    presentSeparateKeys: listPresentKeys(separateVariableNames),
    missingSeparateKeys,
    separateConfigMode,
    hasExplicitDatabaseConfig,
    isRailway,
    isRender,
    hostedPlatform,
    sanitizedUrl: sanitizeUrl(connectionUrl),
    host,
    port,
    database,
    username,
    usesRailwayInternalHost,
    dnsResultOrder: typeof dns.getDefaultResultOrder === 'function' ? dns.getDefaultResultOrder() : dnsResultOrder,
    syncAlter: process.env.DB_SYNC_ALTER === 'true',
    connectTimeoutMs: positiveNumber(process.env.DB_CONNECT_TIMEOUT_MS || process.env.MYSQL_CONNECT_TIMEOUT_MS, 20000),
    help: incompleteSeparateConfigMessage || railwayInternalHelp || (hostedPlatform && !hasExplicitDatabaseConfig ? missingHostedConfigMessage : null),
  },
};

module.exports = { databaseConfig };
