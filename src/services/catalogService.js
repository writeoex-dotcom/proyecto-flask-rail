const { Op } = require('sequelize');
const { Product } = require('../models');
const { products } = require('../data/catalog');

async function seedProducts() {
  const count = await Product.count();
  if (count === 0) {
    await Product.bulkCreate(products);
  }
}

async function getRecommendedProducts(preference) {
  const allProducts = await Product.findAll();
  return allProducts
    .map((product) => {
      let score = product.views;
      if (preference?.species && product.species === preference.species) score += 1000;
      if (preference?.lifeStage && product.lifeStage === preference.lifeStage) score += 500;
      if (preference?.foodLine && product.lineType === preference.foodLine) score += 250;
      if (preference?.medicalCondition && product.tags.includes(preference.medicalCondition)) score += 125;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, 12)
    .map(({ product }) => product);
}

async function incrementProductView(productId) {
  await Product.increment('views', { where: { id: productId } });
  return Product.findByPk(productId);
}

module.exports = { seedProducts, getRecommendedProducts, incrementProductView };
