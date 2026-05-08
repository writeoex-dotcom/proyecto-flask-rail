const session = require('express-session');
const SequelizeStoreFactory = require('connect-session-sequelize');

const { appConfig } = require('../config/appConfig');
const { databaseConfig } = require('../config/database');
const { sequelize } = require('../models');
const { seedProducts } = require('./catalogService');

const SequelizeStore = SequelizeStoreFactory(session.Store);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createSessionStore() {
  // Store persistente para evitar el warning de MemoryStore en producción.
  return new SequelizeStore({
    db: sequelize,
    tableName: appConfig.sessionTableName,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 8 * 60 * 60 * 1000,
  });
}


function getDatabaseErrorCode(error) {
  return error?.parent?.code || error?.original?.code || error?.code || '';
}

function getDatabaseErrorAdvice(error) {
  const code = getDatabaseErrorCode(error);
  const message = error?.message || '';

  if (code === 'ENOTFOUND' || message.includes('getaddrinfo ENOTFOUND')) {
    return databaseConfig.usesRailwayInternalHost
      ? 'No se pudo resolver mysql.railway.internal. Confirma que la app corre dentro de Railway en el mismo proyecto/entorno que MySQL; desde local usa MYSQL_PUBLIC_URL o DATABASE_PUBLIC_URL.'
      : 'No se pudo resolver el host MySQL. Revisa MYSQLHOST/DB_HOST o usa una URL completa válida en MYSQL_URL.';
  }

  if (code === 'ETIMEDOUT' || code === 'EHOSTUNREACH' || message.includes('ETIMEDOUT')) {
    return databaseConfig.usesRailwayInternalHost
      ? 'Timeout conectando a la red privada de Railway. Verifica que MySQL esté en el mismo proyecto/entorno, redeploya el servicio web y confirma que MYSQLPORT=3306.'
      : 'Timeout conectando a MySQL. Revisa host, puerto, firewall o usa MYSQL_PUBLIC_URL si conectas desde fuera de Railway.';
  }

  if (code === 'ECONNREFUSED') {
    return 'MySQL rechazó la conexión. Verifica que el servicio MySQL esté iniciado, que MYSQLPORT sea correcto y que no estés usando localhost en producción.';
  }

  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return 'Credenciales inválidas. Actualiza MYSQLUSER y MYSQLPASSWORD en el servicio web con Variable References del servicio MySQL.';
  }

  if (code === 'ER_BAD_DB_ERROR') {
    return 'La base de datos indicada no existe. En Railway normalmente MYSQLDATABASE=railway; corrige MYSQLDATABASE o usa MYSQL_URL.';
  }

  if (code === 'PROTOCOL_CONNECTION_LOST') {
    return 'La conexión MySQL se cerró durante el arranque. Espera los reintentos o aumenta DB_CONNECT_TIMEOUT_MS.';
  }

  return databaseConfig.summary.help || 'Revisa /ready, las variables MYSQL_URL/MYSQLHOST y los logs completos de Railway.';
}

function buildDatabaseFailure(error) {
  return {
    message: error.message,
    code: getDatabaseErrorCode(error) || null,
    advice: getDatabaseErrorAdvice(error),
  };
}

function describeAttempt(attempt) {
  return databaseConfig.retryAttempts > 0 ? `${attempt}/${databaseConfig.retryAttempts}` : `${attempt}/∞`;
}

async function initializeDatabase(sessionStore, readiness) {
  let lastError;
  let attempt = 1;
  const retryForever = databaseConfig.retryAttempts === 0;

  if (readiness) readiness.databaseConfig = databaseConfig.summary;

  if (databaseConfig.incompleteSeparateConfigMessage) {
    if (readiness) {
      readiness.lastDatabaseError = databaseConfig.incompleteSeparateConfigMessage;
      readiness.lastDatabaseFailure = {
        message: databaseConfig.incompleteSeparateConfigMessage,
        code: 'CONFIG_INCOMPLETE',
        advice: databaseConfig.summary.help,
      };
    }
    console.error(databaseConfig.incompleteSeparateConfigMessage, databaseConfig.summary);
    return false;
  }

  if (databaseConfig.isRailway && databaseConfig.configurationWarnings.length) {
    const warningMessage = databaseConfig.configurationWarnings.join(' ');
    if (readiness) {
      readiness.lastDatabaseError = warningMessage;
      readiness.lastDatabaseFailure = {
        message: warningMessage,
        code: 'CONFIG_WARNING',
        advice: databaseConfig.summary.help,
      };
    }
    console.error(warningMessage, databaseConfig.summary);
    return false;
  }

  if (databaseConfig.hostedPlatform && !databaseConfig.hasExplicitDatabaseConfig) {
    if (readiness) {
      readiness.lastDatabaseError = databaseConfig.missingHostedConfigMessage;
      readiness.lastDatabaseFailure = {
        message: databaseConfig.missingHostedConfigMessage,
        code: 'CONFIG_MISSING',
        advice: databaseConfig.summary.help,
      };
    }
    console.error(databaseConfig.missingHostedConfigMessage, databaseConfig.summary);
    return false;
  }

  while (retryForever || attempt <= databaseConfig.retryAttempts) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: databaseConfig.syncAlter });
      await sessionStore.sync({ alter: databaseConfig.syncAlter });
      await seedProducts();
      if (readiness) {
        readiness.lastDatabaseError = null;
        readiness.lastDatabaseFailure = null;
      }
      console.log(`Base de datos conectada y modelos sincronizados correctamente (alter=${databaseConfig.syncAlter}).`);
      return true;
    } catch (error) {
      lastError = error;
      if (readiness) {
        readiness.lastDatabaseError = error.message;
        readiness.lastDatabaseFailure = buildDatabaseFailure(error);
      }
      const retrying = retryForever || attempt < databaseConfig.retryAttempts;
      if (attempt === 1 || attempt % 12 === 0 || !retrying) {
        console.error(
          `No se pudo conectar a MySQL (intento ${describeAttempt(attempt)}).${retrying ? ' Reintentando...' : ''}`,
          error.message,
          databaseConfig.summary,
        );
      }
      if (retrying) await wait(databaseConfig.retryDelayMs);
    }
    attempt += 1;
  }
  throw lastError;
}

module.exports = { createSessionStore, initializeDatabase };
