module.exports = (sequelize, DataTypes) => sequelize.define('CartItem', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
  status: { type: DataTypes.ENUM('carrito', 'comprado'), allowNull: false, defaultValue: 'carrito' },
}, {
  tableName: 'cart_items',
  indexes: [
    { fields: ['userId'] },
    { fields: ['productId'] },
    { fields: ['status'] },
    { unique: true, fields: ['userId', 'productId', 'status'] },
  ],
});
