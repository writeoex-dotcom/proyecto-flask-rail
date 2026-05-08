module.exports = (sequelize, DataTypes) => sequelize.define('User', {
  email: { type: DataTypes.STRING(180), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('cliente'), allowNull: false, defaultValue: 'cliente' },
  emailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'users',
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['emailVerified'] },
  ],
});
