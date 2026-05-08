const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');

const { appConfig } = require('./config/appConfig');
const { brands, products: catalogProducts } = require('./data/catalog');
const webRoutes = require('./routes/webRoutes');
const { attachLocals } = require('./middleware/locals');

const emptyFlash = { success: [], danger: [], warning: [], info: [] };

function getFallbackProducts() {
  return catalogProducts.map((product, index) => ({
    id: index + 1,
    views: 0,
    ...product,
  }));
}

function getFallbackPreferences(req) {
  return (req.session?.fallbackPreferences || []).filter(Boolean);
}

function getFallbackPreference(req) {
  return getFallbackPreferences(req)[0] || null;
}

function pushFlash(req, res, type, message) {
  req.flash(type, message);
  if (res.locals.flash?.[type]) res.locals.flash[type].push(message);
}

function renderDatabaseOfflinePage(req, res, next) {
  if (req.app.locals.readiness?.databaseReady) return next();

  const products = getFallbackProducts();
  const offlineWarning = 'MySQL todavía no está listo; estás navegando en modo catálogo temporal. /ready muestra el diagnóstico técnico.';

  if (req.method === 'GET' && req.path === '/') {
    pushFlash(req, res, 'warning', offlineWarning);
    const preferences = getFallbackPreferences(req);
    return res.render('home', { title: 'Inicio', brands, products, preference: preferences[0] || null, preferences });
  }

  if (req.method === 'GET' && req.path.startsWith('/product/')) {
    const productId = Number(req.params?.id || req.path.split('/').pop());
    const product = products.find((item) => item.id === productId);
    if (!product) {
      pushFlash(req, res, 'danger', 'Producto no encontrado en el catálogo temporal.');
      return res.redirect('/');
    }
    pushFlash(req, res, 'warning', offlineWarning);
    return res.render('product', { title: product.name, product });
  }

  if (req.method === 'POST' && req.path === '/preferences') {
    const preferenceSlot = Number(req.body.preferenceSlot) === 2 ? 2 : 1;
    const size = req.body.size || '';
    const speciesBySize = { pequeña: ['ave', 'hamster', 'pez'], mediano: ['perro', 'gato'], grande: ['perro'] };
    const allowedSpecies = speciesBySize[size] || ['perro', 'gato', 'ave', 'hamster', 'pez'];
    const species = allowedSpecies.includes(req.body.species) ? req.body.species : '';
    const fallbackPreferences = getFallbackPreferences(req);
    fallbackPreferences[preferenceSlot - 1] = {
      preferenceSlot,
      profileName: String(req.body.profileName || '').trim() || `Mascota ${preferenceSlot}`,
      size,
      species,
      ageRange: req.body.ageRange || '',
      lifeStage: ({ menos_1: 'cachorro', '1_6': 'adulto', mas_6: 'adulto mayor' })[req.body.ageRange] || '',
      foodLine: req.body.foodLine || '',
      medicalCondition: req.body.medicalCondition || '',
      shampooBrand: req.body.shampooBrand || '',
      coatCondition: req.body.coatCondition || '',
      lotionSkinSensitivity: req.body.lotionSkinSensitivity || '',
      accessoryType: req.body.accessoryType || '',
      toySize: req.body.toySize || '',
      toyHardness: req.body.toyHardness || '',
    };
    req.session.fallbackPreferences = fallbackPreferences.slice(0, 2);
    pushFlash(req, res, 'success', `Preferencias de ${fallbackPreferences[preferenceSlot - 1].profileName} guardadas temporalmente mientras MySQL conecta.`);
    return res.redirect('/');
  }

  if (req.method === 'GET' && req.path === '/cart') {
    pushFlash(req, res, 'warning', 'El carrito persistente estará disponible cuando MySQL conecte.');
    return res.render('cart', { title: 'Carrito', items: [] });
  }

  if (req.method === 'POST' && req.path.startsWith('/cart/add/')) {
    pushFlash(req, res, 'warning', 'Para guardar carrito necesitas que MySQL esté listo y una cuenta verificada. Puedes seguir navegando el catálogo.');
    return res.redirect(req.get('referer') || '/');
  }

  if (req.method === 'GET' && req.path === '/register') {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    req.session.captchaExpected = a + b;
    pushFlash(req, res, 'warning', 'El registro se habilitará cuando MySQL conecte.');
    return res.render('register', { title: 'Registro', a, b });
  }

  if (req.method === 'GET' && req.path === '/login') {
    pushFlash(req, res, 'warning', 'El acceso se habilitará cuando MySQL conecte.');
    return res.render('login', { title: 'Acceso' });
  }

  if (req.method === 'GET' && req.path === '/verify') {
    pushFlash(req, res, 'warning', 'La verificación se habilitará cuando MySQL conecte.');
    return res.render('verify', { title: 'Verificación', email: req.session.pendingRegistration?.email || 'pendiente@gmail.com' });
  }

  if (req.method === 'GET' && req.path === '/admin') {
    return res.status(503).render('error', {
      title: 'Administrador no disponible',
      message: 'El panel administrador requiere MySQL para métricas y usuarios.',
      details: req.app.locals.readiness?.lastDatabaseFailure?.advice || req.app.locals.readiness?.lastDatabaseError,
      session: req.session || {},
      currentUser: null,
      flash: res.locals.flash || emptyFlash,
    });
  }

  if (req.method === 'POST') {
    pushFlash(req, res, 'warning', 'Esta acción requiere MySQL. Puedes navegar el sitio mientras la conexión se recupera.');
    return res.redirect(req.get('referer') || '/');
  }

  return next();
}

function createApp({ sessionStore, readiness } = {}) {
  const app = express();
  const appReadiness = readiness || { databaseReady: false, lastDatabaseError: null, lastDatabaseFailure: null, databaseConfig: null };
  app.locals.readiness = appReadiness;
  app.locals.session = {};
  app.locals.currentUser = null;
  app.locals.flash = emptyFlash;
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
    res.status(appReadiness.databaseReady ? 200 : 503).json({
      databaseReady: appReadiness.databaseReady,
      lastDatabaseError: appReadiness.lastDatabaseError,
      lastDatabaseFailure: appReadiness.lastDatabaseFailure,
      databaseConfig: appReadiness.databaseConfig,
    });
  });

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const fallbackSession = session({
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
  });
  const persistentSession = session({
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
  });

  // Mientras MySQL no está listo, usamos sesión temporal en memoria para permitir
  // navegar el catálogo, ver productos y abrir formularios sin tocar el store MySQL.
  app.use((req, res, next) => {
    const middleware = appReadiness.databaseReady ? persistentSession : fallbackSession;
    return middleware(req, res, next);
  });
  app.use(flash());
  app.use(attachLocals);
  app.use(renderDatabaseOfflinePage);

  app.use(webRoutes);

  app.use((req, res) => {
    res.status(404).render('error', {
      title: 'Página no encontrada',
      message: 'No encontramos la página solicitada.',
      session: req.session || {},
      currentUser: res.locals.currentUser || null,
      flash: res.locals.flash || emptyFlash,
    });
  });

  app.use((error, req, res, next) => {
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    console.error(`[${requestId}] Error no controlado`, error);
    res.status(500).render('error', {
      title: 'Error interno',
      message: 'Ocurrió un error seguro. Inténtalo nuevamente.',
      details: `Código de diagnóstico: ${requestId}. Revisa los logs del servidor para ver el detalle técnico.`,
      session: req.session || {},
      currentUser: res.locals.currentUser || null,
      flash: res.locals.flash || emptyFlash,
    });
  });

  return app;
}

module.exports = { createApp };
