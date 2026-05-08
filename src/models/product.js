module.exports = (sequelize, DataTypes) => sequelize.define('Product', {
  name: { type: DataTypes.STRING(160), allowNull: false, unique: true },
  category: { type: DataTypes.STRING(60), allowNull: false },
  brand: { type: DataTypes.STRING(80), allowNull: false },
  species: { type: DataTypes.STRING(40), allowNull: false },
  lifeStage: { type: DataTypes.STRING(40), allowNull: false },
  lineType: { type: DataTypes.STRING(40), allowNull: false },
  tags: { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'products',
  indexes: [
    { unique: true, fields: ['name'] },
    { fields: ['species', 'lifeStage'] },
    { fields: ['category'] },
    { fields: ['lineType'] },
  ],
});
