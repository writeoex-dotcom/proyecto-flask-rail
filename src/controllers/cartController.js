const { CartItem, Product } = require('../models');
const { logEvent } = require('../services/analyticsService');

async function addToCart(req, res) {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    req.flash('danger', 'Producto no encontrado.');
    return res.redirect('/');
  }
  await CartItem.create({ userId: req.session.userId, productId: product.id, quantity: 1 });
  await logEvent(req, 'cart_add', { productId: product.id, name: product.name });
  req.flash('success', 'Producto agregado al carrito.');
  return res.redirect('/cart');
}

async function cart(req, res) {
  const items = await CartItem.findAll({
    where: { userId: req.session.userId },
    include: Product,
    order: [['createdAt', 'DESC']],
  });
  res.render('cart', { title: 'Carrito', items });
}

module.exports = { addToCart, cart };
