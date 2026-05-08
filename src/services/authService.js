const bcrypt = require('bcryptjs');
const { VerificationCode, User } = require('../models');
const { appConfig } = require('../config/appConfig');

const gmailRegex = /^[A-Za-z0-9._%+-]+@gmail\.com$/;

function isValidGmail(email) {
  return gmailRegex.test(String(email || '').toLowerCase());
}

async function createVerificationCode(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + appConfig.verificationCodeTtlMinutes * 60 * 1000);
  await VerificationCode.create({ email, codeHash, expiresAt });
  console.warn(`Código de verificación para ${email}: ${code}`);
  return code;
}

async function consumeVerificationCode(email, code) {
  const record = await VerificationCode.findOne({
    where: { email, consumed: false },
    order: [['createdAt', 'DESC']],
  });
  if (!record || record.expiresAt < new Date()) return false;
  const valid = await bcrypt.compare(code, record.codeHash);
  if (!valid) return false;
  record.consumed = true;
  await record.save();
  return true;
}

async function createClient(email, passwordHash) {
  return User.create({ email, passwordHash, role: 'cliente', emailVerified: true });
}

module.exports = { isValidGmail, createVerificationCode, consumeVerificationCode, createClient };
