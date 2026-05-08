# Fuentes reales del catálogo

Este documento deja trazabilidad de las marcas y productos semilla usados en la home. La tienda muestra precios en soles como valores referenciales para demo; la existencia del producto, etapa, especie y necesidad se valida con fuentes oficiales de marca o retailers especializados cuando la marca no publica una ficha directa en su sitio.

## Criterios aplicados

- No asignar shampoos, camas, collares o juguetes a marcas que solo venden alimento.
- Mantener `comercial` y `medicada` únicamente para productos de comida.
- Etiquetar las dietas veterinarias como `medicada` y con términos de condición (`renal`, `urinaria`, `gastrointestinal`, `cardíaca`) para que las recomendaciones sean coherentes.
- Mostrar una fuente por producto (`sourceUrl`) y una nota corta (`sourceSummary`) sin crear columnas nuevas en MySQL; la metadata se adjunta en memoria desde `catalogService`.
- Eliminar del seed los productos ficticios del prototipo anterior mediante `staleProductNames` para que una base existente no conserve combinaciones incoherentes.

## Fuentes usadas por marca/producto

| Producto o marca | Fuente | Uso en la página |
| --- | --- | --- |
| Ricocan Original Adultos Todas las Razas | https://www.rintisa.com.pe/producto.php?item=63 | Producto comercial para perro adulto. |
| Ricocan Cachorros Carne y Leche Razas Medianas y Grandes | https://ricocan.com/producto/cachorro-carne-y-leche-razas-medianas-y-grandes/ | Producto comercial para cachorro de raza mediana/grande. |
| Ricocan Shampoo Cachorros | https://ricocan.com/producto/ | Shampoo real de la misma marca; no se mezcla con líneas de comida. |
| Dog Chow Gran Comienzo Cachorros Medianos y Grandes | https://purina.com.pe/dogchow/productos/cachorros-medianos-y-grandes | Alimento comercial para cachorros medianos y grandes. |
| Dog Chow Adultos Medianos y Grandes | https://purina.com.pe/dogchow/productos-dogchow | Alimento comercial para perro adulto. |
| Pro Plan Sensitive Skin Cordero Adulto | https://purina.com.pe/proplan/perros/piel-sensible | Alimento especializado para perro adulto con sensibilidad de piel. |
| Pro Plan Sterilized Gato Adulto | https://purina.com.pe/proplan/gatos/esterilizados/producto | Alimento comercial para gato adulto esterilizado. |
| Nath Adult Pollo y Arroz Gato | https://www.nathpetfood.es/producto/nath-adult-pollo-y-arroz-pienso-para-gatos/ | Alimento comercial para gato adulto. |
| Hill's Prescription Diet k/d Kidney Care Canine | https://www.hillspet.com.pe/dog-food/prescription-diet-kd-kidney-care-canned | Dieta veterinaria renal para perro adulto. |
| Hill's Prescription Diet c/d Multicare Feline | https://www.hillspet.com.pe/cat-food/pd-cd-multicare-feline-with-ocean-fish-canned | Dieta veterinaria urinaria para gato. |
| Hill's Prescription Diet i/d Low Fat Digestive Care Canine | https://www.hillspet.com.pe/dog-food/prescription-diet-id-low-fat-digestive-care-dry | Dieta veterinaria digestiva para perro. |
| Brit Veterinary Diet Dog Gastrointestinal | https://www.brit-petfood.gr/product/2776/brit-gastrointestinal.html | Dieta veterinaria gastrointestinal para perro. |
| Vitalcan Therapy Canine Cardiac Health | https://vitalcan.com/producto/cardiac-health-canine/ | Dieta veterinaria cardíaca para perro. |
| Hartz Groomer’s Best Puppy Shampoo | https://www.hartz.com/product/hartz-groomers-best-puppy-shampoo-for-dogs | Shampoo real para cachorro. |
| Burt's Bees Hypoallergenic Dog Shampoo | https://www.petco.com/shop/en/petcostore/product/dog/dog-grooming-and-bathing/burts-bees-for-dogs-hypoallergenic-shampoo | Shampoo real para piel sensible, validado con retailer especializado. |
| Trixie Collar Ajustable Nylon Premium M-L | https://www.trixie.es/Collar-Ajustable-Nylon-Premium-1 | Accesorio real para perro. |
| Trixie Jaula Hámster Plegable con Equipamiento | https://www.trixie.es/Jaula-con-Equipamiento-Esencial | Hábitat real para hámster. |
| KONG Classic Dog Toy | https://www.kongcompany.com/kong-classic/ | Juguete real para perro adulto. |
| KONG Puppy Dog Toy | https://www.kongcompany.com/dog/ | Juguete real para cachorro. |

## Nota para producción

Para vender de forma real se recomienda reemplazar los precios demo por precios del proveedor, SKU interno, stock, imágenes con licencia y condiciones legales de dietas veterinarias (por ejemplo, avisar que se deben usar bajo recomendación profesional).
