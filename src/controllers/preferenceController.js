const { PetPreference } = require('../models');
const { ensureSessionKey } = require('../services/sessionService');
const { logEvent } = require('../services/analyticsService');

const ageMap = {
  menos_1: 'cachorro',
  '1_6': 'adulto',
  mas_6: 'adulto mayor',
};

async function updatePreferences(req, res) {
  const sessionKey = ensureSessionKey(req);
  const [preference] = await PetPreference.findOrCreate({
    where: { sessionKey },
    defaults: { sessionKey, userId: req.session.userId || null },
  });

  const fields = ['size', 'species', 'ageRange', 'foodLine', 'medicalCondition', 'shampooBrand', 'coatCondition', 'lotionSkinSensitivity', 'accessoryType', 'toySize', 'toyHardness'];
  fields.forEach((field) => {
    if (req.body[field]) preference[field] = req.body[field];
  });
  if (preference.ageRange) preference.lifeStage = ageMap[preference.ageRange] || preference.lifeStage;
  if (req.session.userId) preference.userId = req.session.userId;

  await preference.save();
  await logEvent(req, 'preference_update', req.body);
  req.flash('success', 'Preferencias de mascota actualizadas.');
  return res.redirect('/');
}

module.exports = { updatePreferences };
