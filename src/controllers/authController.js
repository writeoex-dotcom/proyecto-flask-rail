const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { appConfig } = require('../config/appConfig');
const { createClient, createVerificationCode, consumeVerificationCode, isValidGmail } = require('../services/authService');
const { logEvent } = require('../services/analyticsService');

function showRegister(req, res) {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  req.session.captchaExpected = a + b;
  res.render('register', { title: 'Registro', a, b });
}

async function register(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (String(req.session.captchaExpected) !== String(req.body.captchaAnswer)) {
    req.flash('danger', 'Captcha incorrecto. Inténtalo de nuevo.');
    return res.redirect('/register');
  }
  if (!isValidGmail(email)) {
    req.flash('danger', 'Solo se permiten correos @gmail.com.');
    return res.redirect('/register');
  }
  if (password.length < 8) {
    req.flash('danger', 'La contraseña debe tener mínimo 8 caracteres.');
    return res.redirect('/register');
  }
  if (await User.findOne({ where: { email } })) {
    req.flash('warning', 'Este correo ya está registrado.');
    return res.redirect('/login');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await createVerificationCode(email);
  req.session.pendingRegistration = { email, passwordHash };
  req.flash('info', 'En desarrollo el código se muestra en logs. En producción conecte SMTP o un proveedor transaccional.');
  return res.redirect('/verify');
}

function showVerify(req, res) {
  if (!req.session.pendingRegistration) {
    req.flash('warning', 'Primero inicia el registro.');
    return res.redirect('/register');
  }
  return res.render('verify', { title: 'Verificación', email: req.session.pendingRegistration.email });
}

async function verify(req, res) {
  const pending = req.session.pendingRegistration;
  if (!pending) {
    req.flash('warning', 'Primero inicia el registro.');
    return res.redirect('/register');
  }
  const valid = await consumeVerificationCode(pending.email, req.body.code);
  if (!valid) {
    req.flash('danger', 'Código incorrecto, expirado o inexistente.');
    return res.redirect('/verify');
  }
  const user = await createClient(pending.email, pending.passwordHash);
  delete req.session.pendingRegistration;
  req.session.userId = user.id;
  req.flash('success', 'Cuenta cliente creada y verificada.');
  return res.redirect('/');
}

function showLogin(req, res) {
  res.render('login', { title: 'Acceso' });
}

async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (email === appConfig.adminEmail && appConfig.adminPasswordHash && await bcrypt.compare(password, appConfig.adminPasswordHash)) {
    req.session.admin = true;
    delete req.session.userId;
    req.flash('success', 'Bienvenido administrador.');
    return res.redirect('/admin');
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    req.flash('danger', 'Credenciales inválidas.');
    return res.redirect('/login');
  }
  req.session.userId = user.id;
  delete req.session.admin;
  await logEvent(req, 'login', { email });
  req.flash('success', 'Sesión iniciada.');
  return res.redirect('/');
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

module.exports = { showRegister, register, showVerify, verify, showLogin, login, logout };
