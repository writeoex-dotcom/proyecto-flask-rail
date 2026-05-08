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

async function initializeDatabase(sessionStore) {
  let lastError;
  for (let attempt = 1; attempt <= databaseConfig.retryAttempts; attempt += 1) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      await sessionStore.sync();
      await seedProducts();
      console.log('Base de datos conectada y sincronizada correctamente.');
      return true;
    } catch (error) {
      lastError = error;
      const retrying = attempt < databaseConfig.retryAttempts;
      console.error(
        `No se pudo conectar a MySQL (intento ${attempt}/${databaseConfig.retryAttempts}).${retrying ? ' Reintentando...' : ''}`,
        error.message,
      );
      if (retrying) await wait(databaseConfig.retryDelayMs);
    }
  }
  throw lastError;
}

module.exports = { createSessionStore, initializeDatabase };
