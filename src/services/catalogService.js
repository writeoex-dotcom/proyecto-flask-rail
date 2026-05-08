const { Op } = require('sequelize');
const { Product } = require('../models');
const { products, staleProductNames } = require('../data/catalog');

const catalogMetadataByName = new Map(products.map((product) => [product.name, product]));
const metadataFields = ['packageSize', 'sourceSummary', 'sourceUrl'];

function decorateProductWithCatalogMetadata(product) {
  if (!product) return product;
  const metadata = catalogMetadataByName.get(product.name);
  if (!metadata) return product;

  metadataFields.forEach((field) => {
    if (typeof product.setDataValue === 'function') {
      product.setDataValue(field, metadata[field]);
    } else {
      product[field] = metadata[field];
    }
  });

  return product;
}

async function seedProducts() {
  if (staleProductNames.length) {
    await Product.destroy({ where: { name: { [Op.in]: staleProductNames } } });
  }

  for (const productData of products) {
    const [product] = await Product.findOrCreate({
      where: { name: productData.name },
      defaults: productData,
    });

    // Keep seeded catalog data fresh after deploys without resetting accumulated views.
    await product.update({
      category: productData.category,
      brand: productData.brand,
      species: productData.species,
      lifeStage: productData.lifeStage,
      lineType: productData.lineType,
      productType: productData.productType || 'general',
      tags: productData.tags,
      price: productData.price,
    });
  }
}

async function getRecommendedProducts(preferenceInput) {
  const preferences = Array.isArray(preferenceInput) ? preferenceInput : [preferenceInput].filter(Boolean);
  const allProducts = (await Product.findAll()).map(decorateProductWithCatalogMetadata);
  return allProducts
    .map((product) => {
      const preferenceScore = preferences.reduce((bestScore, preference) => {
        let score = 0;
        if (preference?.species && product.species === preference.species) score += 1000;
        if (preference?.lifeStage && product.lifeStage === preference.lifeStage) score += 500;
        if (preference?.foodLine && product.category === 'comida' && product.lineType === preference.foodLine) score += 250;
        if (preference?.medicalCondition && product.tags.includes(preference.medicalCondition)) score += 125;
        return Math.max(bestScore, score);
      }, 0);
      const score = product.views + preferenceScore;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .map(({ product }) => product);
}

async function incrementProductView(productId) {
  await Product.increment('views', { where: { id: productId } });
  const product = await Product.findByPk(productId);
  return decorateProductWithCatalogMetadata(product);
}

module.exports = { seedProducts, getRecommendedProducts, incrementProductView, decorateProductWithCatalogMetadata };
