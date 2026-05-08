const { NavigationEvent } = require('../models');
const { ensureSessionKey } = require('./sessionService');

async function logEvent(req, eventType, payload = {}) {
  await NavigationEvent.create({
    userId: req.session.userId || null,
    sessionKey: ensureSessionKey(req),
    eventType,
    payload,
  });
}

module.exports = { logEvent };
