const { Sequelize, DataTypes } = require('sequelize');
const { databaseConfig } = require('../config/database');

// Sequelize acepta una URL completa; esto facilita Railway porque MySQL expone MYSQL_URL.
// Si no existe URL, usamos variables separadas para desarrollo local.
const sequelize = databaseConfig.connectionUrl
  ? new Sequelize(databaseConfig.connectionUrl, {
    dialect: databaseConfig.dialect,
    logging: databaseConfig.logging,
  })
  : new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    databaseConfig,
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
