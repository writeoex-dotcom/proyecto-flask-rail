const { PetPreference } = require('../models');
const { ensureSessionKey } = require('../services/sessionService');
const { logEvent } = require('../services/analyticsService');

const ageMap = {
  menos_1: 'cachorro',
  '1_6': 'adulto',
  mas_6: 'adulto mayor',
};

const speciesBySize = {
  pequeña: ['ave', 'hamster', 'pez'],
  mediano: ['perro', 'gato'],
  grande: ['perro'],
};

function normalizeSlot(rawSlot) {
  const slot = Number(rawSlot);
  return slot === 2 ? 2 : 1;
}

function cleanPreference(body, slot) {
  const size = String(body.size || '').trim();
  const allowedSpecies = speciesBySize[size] || ['perro', 'gato', 'ave', 'hamster', 'pez'];
  const requestedSpecies = String(body.species || '').trim();
  const species = allowedSpecies.includes(requestedSpecies) ? requestedSpecies : '';
  const ageRange = String(body.ageRange || '').trim();
  const lifeStage = ageMap[ageRange] || '';
  const profileName = String(body.profileName || '').trim().slice(0, 80) || `Mascota ${slot}`;

  return {
    profileName,
    size,
    species,
    ageRange,
    lifeStage,
    foodLine: String(body.foodLine || '').trim(),
    medicalCondition: String(body.medicalCondition || '').trim(),
    shampooBrand: String(body.shampooBrand || '').trim(),
    coatCondition: String(body.coatCondition || '').trim(),
    lotionSkinSensitivity: String(body.lotionSkinSensitivity || '').trim(),
    accessoryType: String(body.accessoryType || '').trim(),
    toySize: String(body.toySize || '').trim(),
    toyHardness: String(body.toyHardness || '').trim(),
  };
}

async function updatePreferences(req, res) {
  const sessionKey = ensureSessionKey(req);
  const preferenceSlot = normalizeSlot(req.body.preferenceSlot);
  const preferenceData = cleanPreference(req.body, preferenceSlot);
  const [preference] = await PetPreference.findOrCreate({
    where: { sessionKey, preferenceSlot },
    defaults: { sessionKey, preferenceSlot, userId: req.session.userId || null, ...preferenceData },
  });

  Object.assign(preference, preferenceData);
  if (req.session.userId) preference.userId = req.session.userId;

  await preference.save();
  await logEvent(req, 'preference_update', { preferenceSlot, ...preferenceData });
  req.flash('success', `Preferencias de ${preference.profileName} actualizadas.`);
  return res.redirect('/');
}

module.exports = { updatePreferences, speciesBySize, cleanPreference, normalizeSlot };
