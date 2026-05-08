const { User } = require('../models');
const { ensureSessionKey } = require('../services/sessionService');

async function attachLocals(req, res, next) {
  try {
    ensureSessionKey(req);
    res.locals.flash = {
      success: req.flash('success'),
      danger: req.flash('danger'),
      warning: req.flash('warning'),
      info: req.flash('info'),
    };
    res.locals.session = req.session;
    res.locals.currentUser = null;
    res.locals.databaseReady = Boolean(req.app.locals.readiness?.databaseReady);
    if (res.locals.databaseReady && req.session.userId) {
      res.locals.currentUser = await User.findByPk(req.session.userId);
    }
    next();
  } catch (error) {
    next(error);
  }
}

function requireClient(req, res, next) {
  if (!req.session.userId) {
    req.flash('warning', 'Debes iniciar sesión con una cuenta verificada.');
    return res.redirect('/login');
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    req.flash('danger', 'Acceso solo para el correo administrador configurado.');
    return res.redirect('/login');
  }
  return next();
}

module.exports = { attachLocals, requireClient, requireAdmin };
