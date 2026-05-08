module.exports = (sequelize, DataTypes) => sequelize.define('NavigationEvent', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  sessionKey: { type: DataTypes.STRING(120), allowNull: false },
  eventType: { type: DataTypes.STRING(60), allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false },
}, {
  tableName: 'navigation_events',
  indexes: [
    { fields: ['userId'] },
    { fields: ['sessionKey'] },
    { fields: ['eventType'] },
    { fields: ['createdAt'] },
  ],
});
