const { brands } = require('../data/catalog');
const { PetPreference } = require('../models');
const { ensureSessionKey } = require('../services/sessionService');
const { getRecommendedProducts, incrementProductView } = require('../services/catalogService');
const { logEvent } = require('../services/analyticsService');

async function home(req, res) {
  const preference = await PetPreference.findOne({ where: { sessionKey: ensureSessionKey(req) } });
  const products = await getRecommendedProducts(preference);
  await logEvent(req, 'home_view', { path: '/' });
  res.render('home', { title: 'Inicio', brands, products, preference });
}

async function productDetail(req, res) {
  const product = await incrementProductView(req.params.id);
  if (!product) {
    req.flash('danger', 'Producto no encontrado.');
    return res.redirect('/');
  }
  await logEvent(req, 'product_view', { productId: product.id, name: product.name });
  return res.render('product', { title: product.name, product });
}

module.exports = { home, productDetail };
