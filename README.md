# PetMarket Seguro

Aplicación web tipo e-commerce de mascotas creada con **Node.js + Express** y estructura **MVC**. Incluye home con banner, barra de navegación, accesos de perfil/tienda/carrito, personalización con botón de huella, carrito para clientes verificados, panel administrador con métricas y configuración lista para servidores/Railway.

## Inicio rápido local

```bash
npm install
cp .env.example .env
npm start
```

La aplicación local queda en `http://localhost:3000` si no defines otra variable `PORT`.

## Estructura MVC

```text
server.js                 # Arranque HTTP y conexión de base de datos
src/app.js                # Configuración principal de Express
src/config/               # Variables de app y base de datos
src/controllers/          # Controladores: home, auth, preferencias, carrito, admin
src/models/               # Modelos Sequelize para MySQL
src/routes/               # Rutas web de Express
src/services/             # Lógica de catálogo, sesión, seguridad y analítica
src/views/                # Vistas EJS y layout
public/css, public/js     # Estilos y JavaScript del navegador
docs/                     # Documentación técnica y despliegue Railway
```

## Variables principales

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petmarket
DB_USER=root
DB_PASSWORD=password
DB_DIALECT=mysql
MYSQL_URL=mysql://usuario:clave@host:puerto/base
SESSION_SECRET=cambia-esto
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=hash-generado-con-bcryptjs
VERIFICATION_CODE_TTL_MINUTES=10
```

Localmente puedes usar variables separadas (`DB_HOST`, `DB_USER`, etc.). En Railway se recomienda usar `MYSQL_URL`.

## Despliegue en Railway

El proyecto incluye `railway.json`, `Procfile`, `/health` y escucha en `0.0.0.0:$PORT`, que es el formato esperado para servidores Railway.

Guía completa: [`docs/DEPLOY_RAILWAY.md`](docs/DEPLOY_RAILWAY.md).

## Documentación técnica

Arquitectura, controladores, servicios, modelos y flujos: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Generar `ADMIN_PASSWORD_HASH`

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu-clave-segura',12).then(console.log)"
```

## Seguridad incluida en el prototipo

- Registro solo para clientes con correo `@gmail.com`.
- Captcha matemático básico y código de verificación con expiración antes de crear la cuenta.
- Contraseñas y códigos guardados con `bcryptjs`.
- Rol administrador separado: no se registra desde la web, se habilita por variables de entorno.
- Registro de navegación, vistas, preferencias y carrito en MySQL mediante Sequelize.
- Middleware `helmet`, cookies `httpOnly`, soporte para cookies seguras en producción y separación por controladores/servicios.

Antes de producción real, añade SMTP, protección CSRF, rate limiting, migraciones Sequelize, backups, auditoría de pagos y políticas de privacidad.
