module.exports = (sequelize, DataTypes) => sequelize.define('PetPreference', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  sessionKey: { type: DataTypes.STRING(120), allowNull: false },
  size: DataTypes.STRING(40),
  species: DataTypes.STRING(40),
  ageRange: DataTypes.STRING(40),
  lifeStage: DataTypes.STRING(40),
  foodLine: DataTypes.STRING(40),
  medicalCondition: DataTypes.STRING(80),
  shampooBrand: DataTypes.STRING(80),
  coatCondition: DataTypes.STRING(80),
  lotionSkinSensitivity: DataTypes.STRING(80),
  accessoryType: DataTypes.STRING(80),
  toySize: DataTypes.STRING(40),
  toyHardness: DataTypes.STRING(40),
}, {
  tableName: 'pet_preferences',
});
