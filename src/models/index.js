const { Sequelize, DataTypes } = require('sequelize');
const { databaseConfig } = require('../config/database');

const sequelizeOptions = {
  dialect: databaseConfig.dialect,
  logging: databaseConfig.logging,
  dialectOptions: databaseConfig.dialectOptions,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Sequelize acepta una URL completa; esto facilita Railway porque MySQL expone MYSQL_URL.
// Si no existe URL, usamos variables separadas para desarrollo local o Railway variables.
const sequelize = databaseConfig.connectionUrl
  ? new Sequelize(databaseConfig.connectionUrl, sequelizeOptions)
  : new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    {
      ...sequelizeOptions,
      host: databaseConfig.host,
      port: databaseConfig.port,
    },
  );

const User = require('./user')(sequelize, DataTypes);
const VerificationCode = require('./verificationCode')(sequelize, DataTypes);
const PetPreference = require('./petPreference')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const NavigationEvent = require('./navigationEvent')(sequelize, DataTypes);
const CartItem = require('./cartItem')(sequelize, DataTypes);

// Relaciones principales para consultas de carrito, analítica y perfil de mascota.
User.hasMany(PetPreference, { foreignKey: 'userId' });
PetPreference.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(NavigationEvent, { foreignKey: 'userId' });
NavigationEvent.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  VerificationCode,
  PetPreference,
  Product,
  NavigationEvent,
  CartItem,
};
