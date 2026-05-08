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

function describeAttempt(attempt) {
  return databaseConfig.retryAttempts > 0 ? `${attempt}/${databaseConfig.retryAttempts}` : `${attempt}/∞`;
}

async function initializeDatabase(sessionStore, readiness) {
  let lastError;
  let attempt = 1;
  const retryForever = databaseConfig.retryAttempts === 0;

  if (readiness) readiness.databaseConfig = databaseConfig.summary;

  if (databaseConfig.hostedPlatform && !databaseConfig.hasExplicitDatabaseConfig) {
    if (readiness) readiness.lastDatabaseError = databaseConfig.missingHostedConfigMessage;
    console.error(databaseConfig.missingHostedConfigMessage, databaseConfig.summary);
    return false;
  }

  while (retryForever || attempt <= databaseConfig.retryAttempts) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      await sessionStore.sync();
      await seedProducts();
      if (readiness) readiness.lastDatabaseError = null;
      console.log('Base de datos conectada y sincronizada correctamente.');
      return true;
    } catch (error) {
      lastError = error;
      if (readiness) readiness.lastDatabaseError = error.message;
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
