const { createApp } = require('./src/app');
const { appConfig } = require('./src/config/appConfig');
const { createSessionStore, initializeDatabase } = require('./src/services/databaseService');

const port = appConfig.port;

async function bootstrap() {
  const readiness = { databaseReady: false, lastDatabaseError: null, lastDatabaseFailure: null, databaseConfig: null };
  const sessionStore = createSessionStore();
  const app = createApp({ sessionStore, readiness });

  // Railway recomienda escuchar en :: para compatibilidad IPv4/IPv6 y red privada.
  app.listen(port, '::', () => {
    console.log(`PetMarket Seguro disponible en http://localhost:${port}`);
  });

  try {
    await initializeDatabase(sessionStore, readiness);
    readiness.databaseReady = true;
    readiness.lastDatabaseError = null;
    readiness.lastDatabaseFailure = null;
  } catch (error) {
    readiness.lastDatabaseError = error.message;
    readiness.lastDatabaseFailure = { message: error.message, code: error.code || null, advice: 'Revisa MYSQL_URL o las variables MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE en Railway.' };
    console.error('MySQL no quedó listo después de todos los reintentos:', error);
    console.error('Revisa MYSQL_URL o las variables MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE en Railway.');
  }
}

bootstrap().catch((error) => {
  console.error('No se pudo iniciar la aplicación:', error);
  process.exit(1);
});
