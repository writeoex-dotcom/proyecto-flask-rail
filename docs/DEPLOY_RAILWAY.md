# Despliegue en Railway

Esta guía deja el proyecto listo para publicar el e-commerce **PetMarket Seguro** en Railway usando Node.js, Express y MySQL.

## 1. Archivos preparados para Railway

- `package.json`: Railway detecta Node.js y ejecuta `npm start`.
- `server.js`: escucha en `0.0.0.0` y usa `process.env.PORT`, que Railway asigna automáticamente.
- `railway.json`: fija Nixpacks, comando de inicio, healthcheck y política de reinicio.
- `Procfile`: alternativa compatible para procesos web.
- `/health`: endpoint liviano para validar que el servicio arrancó.
- `src/config/database.js`: acepta `MYSQL_URL` o `DATABASE_URL`, además de variables separadas para desarrollo local.

## 2. Crear proyecto en Railway

1. Sube el repositorio a GitHub.
2. En Railway, crea un proyecto nuevo desde el repositorio.
3. Añade un servicio **MySQL** al proyecto.
4. Copia la variable de conexión del servicio MySQL hacia la app web:
   - Recomendado: `MYSQL_URL=${{MySQL.MYSQL_URL}}`
   - Alternativa: `DATABASE_URL=${{MySQL.MYSQL_URL}}`
5. Define las variables de aplicación listadas abajo.
6. Railway construirá con Nixpacks y ejecutará `npm start`.

## 3. Variables de entorno en Railway

```bash
NODE_ENV=production
SESSION_SECRET=usa-una-clave-larga-y-aleatoria
SECURE_COOKIES=true
MYSQL_URL=${{MySQL.MYSQL_URL}}
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=hash-bcrypt-del-admin
VERIFICATION_CODE_TTL_MINUTES=10
```

Railway define `PORT` automáticamente. No lo escribas manualmente salvo que tengas una razón específica.

## 4. Generar contraseña del administrador

En tu máquina local, después de ejecutar `npm install`:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu-clave-segura',12).then(console.log)"
```

Copia el resultado en `ADMIN_PASSWORD_HASH`. La web no permite registrar administradores; solo permite registrar clientes.

## 5. Comprobaciones después de desplegar

1. Abre la URL pública de Railway.
2. Visita `/health`; debe responder JSON con `status: ok`.
3. Registra un cliente con correo `@gmail.com`.
4. Revisa los logs para ver el código de verificación del prototipo.
5. Entra como administrador con `ADMIN_EMAIL` y la contraseña real que generó el hash.
6. Visita `/admin` y valida que aparezcan métricas, gráficos y tablas.

## 6. Recomendaciones antes de producción real

- Conectar SMTP o proveedor transaccional para enviar el código al correo real.
- Añadir protección CSRF en formularios POST.
- Agregar rate limiting en login, registro y verificación.
- Usar migraciones Sequelize en vez de `sequelize.sync()` para cambios controlados.
- Habilitar backups de MySQL y revisar retención.
- Integrar pasarela de pago certificada si se venderá con dinero real.
- Publicar políticas de privacidad y términos de tratamiento de datos.
