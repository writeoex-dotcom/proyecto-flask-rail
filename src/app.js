const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');

const { appConfig } = require('./config/appConfig');
const webRoutes = require('./routes/webRoutes');
const { attachLocals } = require('./middleware/locals');

function createApp({ sessionStore, readiness } = {}) {
  const app = express();
  const appReadiness = readiness || { databaseReady: false };
  app.locals.readiness = appReadiness;
  app.locals.session = {};
  app.locals.currentUser = null;
  app.locals.flash = { success: [], danger: [], warning: [], info: [] };
  app.locals.databaseReady = false;

  app.disable('x-powered-by');
  // Railway trabaja detrás de proxy HTTPS; esto permite cookies secure correctas.
  app.set('trust proxy', 1);

  // Healthcheck ultraligero para Railway: debe ir antes de sesiones, flash, vistas y MySQL.
  // Así el deploy no falla si la base de datos todavía está despertando o reintentando conexión.
  app.get('/health', (req, res) => res.status(200).type('text/plain').send('ok'));
  app.head('/health', (req, res) => res.sendStatus(200));
  // Readiness real: confirma si MySQL terminó de conectar/sincronizar.
  app.get('/ready', (req, res) => {
    res.status(appReadiness.databaseReady ? 200 : 503).json({ databaseReady: appReadiness.databaseReady });
  });

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(session({
    store: sessionStore,
    name: 'petmarket.sid',
    secret: appConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: appConfig.secureCookies,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }));
  app.use(flash());
  app.use(attachLocals);

  app.use((req, res, next) => {
    if (appReadiness.databaseReady) return next();
    return res.status(503).render('error', {
      title: 'Base de datos iniciando',
      message: 'El servidor web está activo, pero MySQL aún está conectando. Revisa /ready o las variables MYSQL_URL/MYSQLHOST en Railway.',
    });
  });

  app.use(webRoutes);

  app.use((req, res) => {
    res.status(404).render('error', {
      title: 'Página no encontrada',
      message: 'No encontramos la página solicitada.',
      session: req.session || {},
      currentUser: res.locals.currentUser || null,
      flash: res.locals.flash || { success: [], danger: [], warning: [], info: [] },
    });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render('error', {
      title: 'Error interno',
      message: 'Ocurrió un error seguro. Inténtalo nuevamente.',
      session: req.session || {},
      currentUser: res.locals.currentUser || null,
      flash: res.locals.flash || { success: [], danger: [], warning: [], info: [] },
    });
  });

  return app;
}

module.exports = { createApp };
