const { createApp } = require('./src/app');
const { sequelize } = require('./src/models');
const { seedProducts } = require('./src/services/catalogService');

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = createApp();
  await sequelize.sync();
  await seedProducts();
  app.listen(port, () => {
    console.log(`PetMarket Seguro disponible en http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('No se pudo iniciar la aplicación:', error);
  process.exit(1);
});
