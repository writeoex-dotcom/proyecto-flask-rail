# Documentación técnica

## Objetivo

PetMarket Seguro es un prototipo MVC para un e-commerce de mascotas. El objetivo es combinar catálogo, personalización, carrito, seguridad básica y analítica para investigación de mercado.

## Capas del sistema

```text
Navegador
  ↓
Express routes: src/routes/webRoutes.js
  ↓
Controllers: src/controllers/*
  ↓
Services: src/services/*
  ↓
Models Sequelize: src/models/*
  ↓
MySQL
```

## Controladores

- `homeController`: renderiza el inicio, incrementa vistas de productos y carga recomendaciones.
- `preferenceController`: guarda respuestas opcionales de la huella y actualiza el perfil de mascota.
- `authController`: maneja registro, captcha, verificación, login, logout y acceso admin por entorno.
- `cartController`: restringe carrito a clientes con sesión verificada.
- `adminController`: genera conteos y agregaciones para gráficos del administrador.

## Servicios

- `authService`: valida Gmail, crea códigos temporales, consume códigos y crea clientes.
- `catalogService`: siembra productos base y calcula recomendaciones por puntuación.
- `analyticsService`: guarda eventos de navegación con sesión/usuario.
- `sessionService`: crea una llave anónima estable por sesión para preferencias y analítica.

## Modelos principales

- `User`: clientes verificados. El rol es solo `cliente`.
- `VerificationCode`: código hasheado, expiración y estado consumido.
- `PetPreference`: perfil de compra por mascota y preferencias opcionales.
- `Product`: catálogo inicial con categoría, marca, especie, etapa, línea y vistas.
- `NavigationEvent`: eventos para analítica de mercado.
- `CartItem`: productos en carrito de clientes autenticados.

## Flujo de personalización

1. El usuario toca el botón flotante de huella.
2. Responde preguntas opcionales: tamaño, mascota, edad, línea, condición médica, shampoo, loción, accesorios y juguetes.
3. El controlador traduce edad a etapa: cachorro, adulto o adulto mayor.
4. `catalogService` prioriza productos que coinciden con especie, etapa, línea y condición.
5. Las respuestas quedan guardadas en MySQL por sesión y, si existe login, por usuario.

## Flujo de seguridad de cuenta

1. El cliente completa Gmail, contraseña y captcha.
2. Se valida que el correo sea `@gmail.com`.
3. Se guarda contraseña hasheada en sesión temporal y se crea un código hasheado con expiración.
4. El cliente digita el código.
5. Si el código es correcto y no expiró, se crea el usuario cliente verificado.
6. El administrador no se registra: se valida contra `ADMIN_EMAIL` y `ADMIN_PASSWORD_HASH`.

## Notas de mantenimiento

- Mantener controladores pequeños y mover lógica reutilizable a servicios.
- Evitar credenciales en el repositorio; usar `.env` local y variables Railway.
- Si se agregan tablas nuevas, documentarlas aquí y considerar migraciones.
- Si se agregan formularios críticos, añadir CSRF y rate limiting.
