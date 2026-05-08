module.exports = (sequelize, DataTypes) => sequelize.define('VerificationCode', {
  email: { type: DataTypes.STRING(180), allowNull: false },
  codeHash: { type: DataTypes.STRING(255), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  consumed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'verification_codes',
});
