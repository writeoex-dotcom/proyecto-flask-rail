const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');

const { appConfig } = require('./config/appConfig');
const webRoutes = require('./routes/webRoutes');
const { attachLocals } = require('./middleware/locals');

function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(session({
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
  app.use(webRoutes);

  app.use((req, res) => {
    res.status(404).render('error', { title: 'Página no encontrada', message: 'No encontramos la página solicitada.' });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render('error', { title: 'Error interno', message: 'Ocurrió un error seguro. Inténtalo nuevamente.' });
  });

  return app;
}

module.exports = { createApp };
