const { createApp } = require('./src/app');
const { appConfig } = require('./src/config/appConfig');
const { createSessionStore, initializeDatabase } = require('./src/services/databaseService');

const port = appConfig.port;

async function bootstrap() {
  const readiness = { databaseReady: false };
  const sessionStore = createSessionStore();
  const app = createApp({ sessionStore, readiness });

  // Railway requiere escuchar en 0.0.0.0:$PORT para exponer el servicio.
  app.listen(port, '0.0.0.0', () => {
    console.log(`PetMarket Seguro disponible en http://localhost:${port}`);
  });

  try {
    await initializeDatabase(sessionStore);
    readiness.databaseReady = true;
  } catch (error) {
    console.error('MySQL no quedó listo después de todos los reintentos:', error);
    console.error('Revisa MYSQL_URL o las variables MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE en Railway.');
  }
}

bootstrap().catch((error) => {
  console.error('No se pudo iniciar la aplicación:', error);
  process.exit(1);
});
