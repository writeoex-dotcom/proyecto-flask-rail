# Despliegue en Railway

Esta guía deja el proyecto listo para publicar el e-commerce **PetMarket Seguro** en Railway usando Node.js, Express y MySQL.

## Archivos preparados para Railway

- `package.json`: Railway detecta Node.js y ejecuta `npm start`.
- `server.js`: escucha en `0.0.0.0` y usa `process.env.PORT`, que Railway asigna automáticamente.
- `railway.json`: fija Nixpacks, comando de inicio, healthcheck y política de reinicio.
- `Procfile`: alternativa compatible para procesos web.
- `/health`: endpoint liviano para validar que el servicio HTTP arrancó; no usa sesión ni MySQL.
- `/ready`: endpoint para validar que MySQL ya conectó y sincronizó tablas.
- `src/config/database.js`: acepta `MYSQL_URL`, `DATABASE_URL` o variables `MYSQLHOST`/`MYSQLPORT`/`MYSQLUSER`/`MYSQLPASSWORD`/`MYSQLDATABASE`.

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

Si Railway no muestra `MYSQL_URL`, usa `MYSQL_PUBLIC_URL=${{MySQL.MYSQL_PUBLIC_URL}}` o copia estas variables desde el servicio MySQL hacia el servicio web:

```bash
MYSQLHOST=...
MYSQLPORT=3306
MYSQLDATABASE=...
MYSQLUSER=...
MYSQLPASSWORD=...
MYSQL_DATABASE=...
MYSQL_ROOT_PASSWORD=...
```

### 4. Variables de entorno recomendadas

```bash
NODE_ENV=production
SESSION_SECRET=usa-una-clave-larga-y-aleatoria
SECURE_COOKIES=true
MYSQL_URL=${{MySQL.MYSQL_URL}}
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=hash-bcrypt-del-admin
DB_CONNECT_RETRIES=0
DB_CONNECT_RETRY_DELAY_MS=5000
SESSION_TABLE_NAME=sessions
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
2. Visita `/health`; debe responder `ok` con HTTP 200.
3. Visita `/ready`; debe responder `databaseReady: true` cuando MySQL esté listo.
4. Registra un cliente con correo `@gmail.com`.
5. Revisa los logs para ver el código de verificación del prototipo.
6. Entra como administrador con `ADMIN_EMAIL` y la contraseña real que generó el hash.
7. Visita `/admin` y valida que aparezcan métricas, gráficos y tablas.
8. Cambia entre modo claro y oscuro para confirmar que `localStorage` conserva la preferencia.

## Solución de problemas

Antes de cambiar código, revisa `https://status.railway.com/`. Si Railway marca `Build Machines (Metal)` como Investigating/Degraded, el build puede estar en cola por una incidencia de plataforma. En ese caso espera, vuelve a desplegar cuando se resuelva y consulta [`RAILWAY_TROUBLESHOOTING.md`](RAILWAY_TROUBLESHOOTING.md).


- **Healthcheck failure**: confirma que `railway.json` apunte a `/health`. Ese endpoint está antes de sesiones/MySQL y debe responder `ok` con HTTP 200. Revisa también que `server.js` escuche en `0.0.0.0`.
- **Error de base de datos / ECONNREFUSED**: valida que `MYSQL_URL` exista en el servicio web como Variable Reference, no solo en el servicio MySQL. Si no hay URL, configura `MYSQL_PUBLIC_URL` o `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER` y `MYSQLPASSWORD`. Revisa `/ready` para ver `databaseConfig` sin secretos: `presentUrlKeys`, `urlSource`, `hasExplicitDatabaseConfig`, `host`, `database` y `username`.
- **Sesión no persiste**: confirma `SESSION_SECRET`, `SESSION_TABLE_NAME=sessions`, `SECURE_COOKIES=true` con `NODE_ENV=production` y que `/ready` esté en verde.
- **No entra admin**: genera de nuevo `ADMIN_PASSWORD_HASH` con `bcryptjs` y pega el hash completo.

## Recomendaciones antes de producción real

- Conectar SMTP o proveedor transaccional para enviar el código al correo real.
- Añadir protección CSRF en formularios POST.
- Agregar rate limiting en login, registro y verificación.
- Usar migraciones Sequelize en vez de `sequelize.sync()` para cambios controlados.
- Habilitar backups de MySQL y revisar retención.
- Integrar pasarela de pago certificada si se venderá con dinero real.
- Publicar políticas de privacidad y términos de tratamiento de datos.

## Diferencia entre `/health` y `/ready`

- `/health`: lo usa Railway. Solo confirma que Express está escuchando y debe responder rápido aunque MySQL esté caído.
- `/ready`: lo usas tú para saber si MySQL ya conectó, sincronizó tablas y sembró productos. Si devuelve 503, revisa variables de base de datos o espera los reintentos.

## Build queue en Hobby/Trial

Cuando el despliegue se queda en cola antes de mostrar logs de `npm install`, normalmente no es un fallo de la app. Railway todavía no asignó una máquina de build. Este repo ayuda a que el build sea más liviano con `nixpacks.toml`, pero si hay incidente global de Build Machines hay que esperar o reintentar después.

## Variable Reference en Railway

En el servicio **web** abre Variables y usa **Add a Variable Reference**. Ejemplo:

```bash
MYSQL_URL=${{MySQL.MYSQL_URL}}
```

Si solo ves las variables dentro del servicio MySQL, la app web no las recibe automáticamente. Deben estar también referenciadas en el servicio web. Si `/ready` muestra `hasExplicitDatabaseConfig: false` y `host: localhost`, este es exactamente el problema.

## Validar datos después del deploy

Después de que `/ready` muestre `databaseReady: true`, entra al home y verifica que aparezcan productos comerciales, medicados, accesorios, juguetes, shampoo y lociones. El seed actualiza datos existentes sin reiniciar `views`, por lo que puedes corregir catálogo con nuevos deploys sin perder analítica.
