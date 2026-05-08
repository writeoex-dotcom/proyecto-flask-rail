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
User.hasMany(PetPreference, { foreignKey: { name: 'userId', allowNull: true }, onDelete: 'SET NULL' });
PetPreference.belongsTo(User, { foreignKey: { name: 'userId', allowNull: true }, onDelete: 'SET NULL' });
User.hasMany(CartItem, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
Product.hasMany(CartItem, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'CASCADE' });
User.hasMany(NavigationEvent, { foreignKey: { name: 'userId', allowNull: true }, onDelete: 'SET NULL' });
NavigationEvent.belongsTo(User, { foreignKey: { name: 'userId', allowNull: true }, onDelete: 'SET NULL' });

module.exports = {
  sequelize,
  User,
  VerificationCode,
  PetPreference,
  Product,
  NavigationEvent,
  CartItem,
};
