const crypto = require('crypto');

function ensureSessionKey(req) {
  if (!req.session.sessionKey) {
    req.session.sessionKey = crypto.randomBytes(24).toString('hex');
  }
  return req.session.sessionKey;
}

module.exports = { ensureSessionKey };
