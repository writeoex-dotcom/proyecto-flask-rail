require('dotenv').config();

// Configuración central de la aplicación.
// Railway define NODE_ENV/PORT y permite crear estas variables desde el panel.
const isProduction = process.env.NODE_ENV === 'production';

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  // En producción se recomienda usar cookies seguras; Express confía en el proxy en src/app.js.
  secureCookies: process.env.SECURE_COOKIES ? process.env.SECURE_COOKIES === 'true' : isProduction,
  sessionTableName: process.env.SESSION_TABLE_NAME || 'sessions',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  verificationCodeTtlMinutes: Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10),
};

module.exports = { appConfig };
