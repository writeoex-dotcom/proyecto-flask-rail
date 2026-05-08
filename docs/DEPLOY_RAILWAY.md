# Despliegue en Railway

Esta guía deja el proyecto listo para publicar el e-commerce **PetMarket Seguro** en Railway usando Node.js, Express y MySQL.

## Archivos preparados para Railway

- `package.json`: Railway detecta Node.js y ejecuta `npm start`.
- `server.js`: escucha en `0.0.0.0` y usa `process.env.PORT`, que Railway asigna automáticamente.
- `railway.json`: fija Nixpacks, comando de inicio, healthcheck y política de reinicio.
- `Procfile`: alternativa compatible para procesos web.
- `/health`: endpoint liviano para validar que el servicio arrancó.
- `src/config/database.js`: acepta `MYSQL_URL` o `DATABASE_URL`, además de variables separadas para desarrollo local.

## Paso a paso

### 1. Subir a GitHub

```bash
git add .
git commit -m "Deploy PetMarket Railway"
git push origin main
```

### 2. Crear proyecto Railway

1. Crea un proyecto nuevo en Railway.
2. Selecciona **Deploy from GitHub repo**.
3. Elige el repositorio.
4. Railway detectará `package.json` y usará Nixpacks.

### 3. Añadir MySQL

1. Agrega un servicio **MySQL** al mismo proyecto.
2. En el servicio web, crea:

```bash
MYSQL_URL=${{MySQL.MYSQL_URL}}
```

También puedes usar:

```bash
DATABASE_URL=${{MySQL.MYSQL_URL}}
```

### 4. Variables de entorno recomendadas

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

### 5. Generar contraseña del administrador

En tu máquina local, después de ejecutar `npm install`:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu-clave-segura',12).then(console.log)"
```

Copia el resultado en `ADMIN_PASSWORD_HASH`. La web no permite registrar administradores; solo permite registrar clientes.

### 6. Verificaciones posteriores

1. Abre la URL pública de Railway.
2. Visita `/health`; debe responder JSON con `status: ok`.
3. Registra un cliente con correo `@gmail.com`.
4. Revisa los logs para ver el código de verificación del prototipo.
5. Entra como administrador con `ADMIN_EMAIL` y la contraseña real que generó el hash.
6. Visita `/admin` y valida que aparezcan métricas, gráficos y tablas.
7. Cambia entre modo claro y oscuro para confirmar que `localStorage` conserva la preferencia.

## Solución de problemas

- **La app no abre**: revisa que `railway.json` use `npm start` y que `server.js` escuche en `0.0.0.0`.
- **Error de base de datos**: valida que `MYSQL_URL` exista en el servicio web, no solo en el servicio MySQL.
- **Sesión no persiste**: confirma `SESSION_SECRET` y `SECURE_COOKIES=true` con `NODE_ENV=production`.
- **No entra admin**: genera de nuevo `ADMIN_PASSWORD_HASH` con `bcryptjs` y pega el hash completo.

## Recomendaciones antes de producción real

- Conectar SMTP o proveedor transaccional para enviar el código al correo real.
- Añadir protección CSRF en formularios POST.
- Agregar rate limiting en login, registro y verificación.
- Usar migraciones Sequelize en vez de `sequelize.sync()` para cambios controlados.
- Habilitar backups de MySQL y revisar retención.
- Integrar pasarela de pago certificada si se venderá con dinero real.
- Publicar políticas de privacidad y términos de tratamiento de datos.
