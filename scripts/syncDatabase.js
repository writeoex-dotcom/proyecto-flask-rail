const { sequelize } = require('../src/models');
const { databaseConfig } = require('../src/config/database');
const { createSessionStore } = require('../src/services/databaseService');
const { seedProducts } = require('../src/services/catalogService');

async function main() {
  const sessionStore = createSessionStore();
  console.log('Conectando a MySQL con esta configuración segura:', databaseConfig.summary);
  await sequelize.authenticate();
  await sequelize.sync({ alter: databaseConfig.syncAlter });
  await sessionStore.sync({ alter: databaseConfig.syncAlter });
  await seedProducts();
  console.log(`Modelos creados/sincronizados correctamente en MySQL (alter=${databaseConfig.syncAlter}).`);
}

main()
  .catch((error) => {
    console.error('No se pudieron sincronizar los modelos:', error.message);
    if (databaseConfig.railwayInternalHelp) console.error(databaseConfig.railwayInternalHelp);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
