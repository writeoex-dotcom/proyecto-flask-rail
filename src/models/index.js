const { Sequelize, DataTypes } = require('sequelize');
const { databaseConfig } = require('../config/database');

const sequelize = new Sequelize(
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
