require('dotenv').config();

const appConfig = {
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  secureCookies: process.env.SECURE_COOKIES === 'true',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  verificationCodeTtlMinutes: Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10),
};

module.exports = { appConfig };
