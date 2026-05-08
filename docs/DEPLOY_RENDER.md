# Despliegue en Render

Esta guía explica cómo desplegar **PetMarket Seguro** en Render como una app web Node/Express usando MySQL externo.

## Servicios que usará la app web en Render

Render ejecutará principalmente un servicio:

| Servicio | Render type | Uso |
| --- | --- | --- |
| `petmarket-seguro-web` | Web Service Node | App Express, vistas EJS, `/health`, `/ready`, catálogo, auth, carrito y admin |
| MySQL externo | External database | Persistencia Sequelize: usuarios, productos, preferencias, eventos, carrito y sesiones |

> Nota: Render ofrece PostgreSQL administrado como producto principal. Esta app está hecha para MySQL, así que en Render debes conectar una base MySQL externa (por ejemplo Railway MySQL, Aiven, PlanetScale, DigitalOcean Managed MySQL, un VPS, etc.).

## Opción A: usar `render.yaml` Blueprint

El repo incluye `render.yaml` con:

- `runtime: node`
- `buildCommand: npm install --omit=dev`
- `startCommand: npm start`
- `healthCheckPath: /health`
- variables de entorno base
- secretos marcados con `sync: false`

Pasos:

1. Sube el repo a GitHub.
2. En Render, crea un **Blueprint** desde el repo.
3. Render leerá `render.yaml`.
4. Cuando pida variables secretas, completa:

```bash
MYSQL_URL=mysql://usuario:password@host:puerto/base
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=hash-bcrypt-del-admin
```

`SESSION_SECRET` se genera automáticamente con `generateValue: true`.

## Opción B: crear Web Service manualmente

1. En Render, crea **New + > Web Service**.
2. Conecta tu repo.
3. Usa estos valores:

```bash
Runtime: Node
Build Command: npm install --omit=dev
Start Command: npm start
Health Check Path: /health
```

4. Agrega variables:

```bash
NODE_ENV=production
SECURE_COOKIES=true
SESSION_SECRET=una-clave-larga-aleatoria
SESSION_TABLE_NAME=sessions
DB_CONNECT_RETRIES=0
DB_CONNECT_RETRY_DELAY_MS=5000
MYSQL_URL=mysql://usuario:password@host:puerto/base
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=hash-bcrypt-del-admin
VERIFICATION_CODE_TTL_MINUTES=10
```

Render define `PORT` automáticamente. No lo configures manualmente.

## Crear `ADMIN_PASSWORD_HASH`

Localmente:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu-clave-segura',12).then(console.log)"
```

Copia el resultado en `ADMIN_PASSWORD_HASH`.

## Verificación después del deploy

1. Abre `https://tu-servicio.onrender.com/health`; debe responder `ok`.
2. Abre `/ready`; debe mostrar `databaseReady: true` cuando MySQL conecte.
3. Si `/ready` muestra `databaseReady: false`, revisa `lastDatabaseError` y `databaseConfig`.
4. Si `databaseConfig.hasExplicitDatabaseConfig` es `false`, falta `MYSQL_URL` en Environment Variables del Web Service.
5. Si `databaseConfig.urlSource` es `MYSQL_URL`, la app sí recibió la variable y el problema está en credenciales, host, puerto o permisos de red.

## Recomendaciones para MySQL externo

- Usa una URL pública si el proveedor MySQL no comparte red privada con Render.
- Asegura que el host MySQL permita conexiones desde Render.
- Usa SSL si tu proveedor lo requiere (`DB_SSL=true`).
- No uses `localhost` en Render; ahí apunta al contenedor web, no a tu base de datos.
