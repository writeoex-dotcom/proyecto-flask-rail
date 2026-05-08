const brands = [
  { name: 'Ricocan', kind: 'comercial', url: 'https://www.ricocan.com/', description: 'Marca comercial conocida en Perú para alimento de perros.' },
  { name: 'Dog Chow', kind: 'comercial', url: 'https://purina.com.pe/dogchow', description: 'Línea Purina para alimentación diaria de perros.' },
  { name: 'Pro Plan', kind: 'comercial y medicada', url: 'https://purina.com.pe/proplan/productos', description: 'Nutrición Purina por edad, sensibilidad y necesidades específicas.' },
  { name: "Hill's Prescription Diet", kind: 'medicada', url: 'https://www.hillspet.com.pe/prescription-diet/dog-food', description: 'Alimentos terapéuticos como renal, urinario, digestivo y dermatológico.' },
  { name: 'Brit Care', kind: 'especializada', url: 'https://brit-petfood.com/en/brit-care', description: 'Alimentos super premium y especializados para perros y gatos.' },
  { name: 'Nath', kind: 'comercial/especializada', url: 'https://www.nathpetfood.es/', description: 'Alimentos para perros y gatos por etapa de vida.' },
  { name: 'Vitalcan Therapy', kind: 'medicada', url: 'https://vitalcan.com/portal-veterinario/linea-therapy/', description: 'Línea veterinaria con fórmulas renal, gastrointestinal y más.' },
];

const products = [
  { name: 'Ricocan Adulto Razas Medianas', category: 'comida', brand: 'Ricocan', species: 'perro', lifeStage: 'adulto', lineType: 'comercial', tags: 'mediano,pollo', price: 89.90 },
  { name: 'Dog Chow Cachorro Mediano y Grande', category: 'comida', brand: 'Dog Chow', species: 'perro', lifeStage: 'cachorro', lineType: 'comercial', tags: 'mediano,grande', price: 92.50 },
  { name: 'Pro Plan Adult Sensitive Skin', category: 'comida', brand: 'Pro Plan', species: 'perro', lifeStage: 'adulto', lineType: 'comercial', tags: 'piel sensible,dermatológico', price: 165.00 },
  { name: "Hill's k/d Cuidado Renal", category: 'comida', brand: "Hill's Prescription Diet", species: 'perro', lifeStage: 'adulto mayor', lineType: 'medicada', tags: 'renal,veterinario', price: 219.90 },
  { name: "Hill's c/d Urinary Care", category: 'comida', brand: "Hill's Prescription Diet", species: 'gato', lifeStage: 'adulto', lineType: 'medicada', tags: 'urinaria,veterinario', price: 205.90 },
  { name: 'Brit Care Gastrointestinal', category: 'comida', brand: 'Brit Care', species: 'perro', lifeStage: 'adulto', lineType: 'medicada', tags: 'gastrointestinal', price: 178.00 },
  { name: 'Nath Adult Cat', category: 'comida', brand: 'Nath', species: 'gato', lifeStage: 'adulto', lineType: 'comercial', tags: 'interior', price: 118.00 },
  { name: 'Shampoo Piel Sensible', category: 'shampoo', brand: 'Pro Plan', species: 'perro', lifeStage: 'adulto', lineType: 'comercial', tags: 'piel sensible,pelo corto', price: 35.90 },
  { name: 'Loción Hipoalergénica Cachorro', category: 'lociones', brand: 'Brit Care', species: 'perro', lifeStage: 'cachorro', lineType: 'comercial', tags: 'piel sensible', price: 29.90 },
  { name: 'Placa personalizada', category: 'accesorios', brand: 'Dog Chow', species: 'perro', lifeStage: 'adulto', lineType: 'comercial', tags: 'placa,collar', price: 19.90 },
  { name: 'Cama acolchada antialérgica', category: 'accesorios', brand: 'Nath', species: 'gato', lifeStage: 'adulto mayor', lineType: 'comercial', tags: 'cama,sensible', price: 119.90 },
  { name: 'Juguete mordedor duro grande', category: 'juguetes', brand: 'Ricocan', species: 'perro', lifeStage: 'adulto', lineType: 'comercial', tags: 'grande,duro', price: 42.90 },
  { name: 'Hamster Mix Accesorios', category: 'accesorios', brand: 'Nath', species: 'hamster', lifeStage: 'adulto', lineType: 'comercial', tags: 'pequeña', price: 24.90 },
];

module.exports = { brands, products };
