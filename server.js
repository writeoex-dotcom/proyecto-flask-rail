const { createApp } = require('./src/app');
const { sequelize } = require('./src/models');
const { seedProducts } = require('./src/services/catalogService');

const { appConfig } = require('./src/config/appConfig');

const port = appConfig.port;

async function bootstrap() {
  const app = createApp();
  await sequelize.sync();
  await seedProducts();
  // Railway requiere escuchar en 0.0.0.0:$PORT para exponer el servicio.
  app.listen(port, '0.0.0.0', () => {
    console.log(`PetMarket Seguro disponible en http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('No se pudo iniciar la aplicación:', error);
  process.exit(1);
});
