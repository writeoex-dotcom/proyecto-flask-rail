const { fn, col } = require('sequelize');
const { User, CartItem, Product, NavigationEvent } = require('../models');

async function dashboard(req, res) {
  const [usersCount, cartsCount, topProducts, eventCounts, categoryViews] = await Promise.all([
    User.count(),
    CartItem.count(),
    Product.findAll({ order: [['views', 'DESC']], limit: 10 }),
    NavigationEvent.findAll({
      attributes: ['eventType', [fn('COUNT', col('id')), 'total']],
      group: ['eventType'],
      raw: true,
    }),
    Product.findAll({
      attributes: ['category', [fn('SUM', col('views')), 'total']],
      group: ['category'],
      raw: true,
    }),
  ]);
  res.render('admin', { title: 'Administración', usersCount, cartsCount, topProducts, eventCounts, categoryViews });
}

module.exports = { dashboard };
