# PetMarket Seguro

Aplicación web tipo e-commerce de mascotas creada con **Node.js + Express** y estructura **MVC**. Incluye home con banner, barra de navegación, accesos de perfil/tienda/carrito, personalización con botón de huella, carrito para clientes verificados y panel administrador con métricas.

## Estructura MVC

```text
server.js                 # Arranque de la aplicación
src/app.js                # Configuración principal de Express
src/config/               # Variables de app y base de datos
src/controllers/          # Controladores: home, auth, preferencias, carrito, admin
src/models/               # Modelos Sequelize para MySQL
src/routes/               # Rutas web de Express
src/services/             # Lógica de catálogo, sesión, seguridad y analítica
src/views/                # Vistas EJS y layout
public/css, public/js     # Estilos y JavaScript del navegador
```

## Configuración

```bash
npm install
cp .env.example .env
npm start
```

Variables principales:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petmarket
DB_USER=root
DB_PASSWORD=password
DB_DIALECT=mysql
SESSION_SECRET=cambia-esto
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=hash-generado-con-bcryptjs
VERIFICATION_CODE_TTL_MINUTES=10
```

Para generar `ADMIN_PASSWORD_HASH`:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu-clave-segura',12).then(console.log)"
```

## Seguridad incluida en el prototipo

- Registro solo para clientes con correo `@gmail.com`.
- Captcha matemático básico y código de verificación con expiración antes de crear la cuenta.
- Contraseñas y códigos guardados con `bcryptjs`.
- Rol administrador separado: no se registra desde la web, se habilita por variables de entorno.
- Registro de navegación, vistas, preferencias y carrito en MySQL mediante Sequelize.
- Middleware `helmet`, cookies `httpOnly` y separación de responsabilidades por controladores/servicios.

En producción se debe conectar un proveedor SMTP real, activar HTTPS, cookies seguras, rate limiting, protección CSRF, backups cifrados, auditoría de pagos y cumplimiento de protección de datos.
