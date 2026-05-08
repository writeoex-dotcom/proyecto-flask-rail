const { Product } = require('../models');
const { products } = require('../data/catalog');

async function seedProducts() {
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
      tags: productData.tags,
      price: productData.price,
    });
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
