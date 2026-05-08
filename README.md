# PetMarket Seguro

PetMarket Seguro es una aplicación web tipo e-commerce de mascotas creada con **Node.js + Express**, estructura **MVC**, vistas **EJS**, base de datos **MySQL/Sequelize**, modo claro/oscuro y configuración lista para desplegar en **Railway**.

La experiencia incluye home con banner publicitario, navegación profesional, accesos de perfil/tienda/carrito, personalización con botón de huella, carrito para clientes verificados, panel administrador con métricas y registro de analítica para investigación de mercado.

## Características principales

- **Arquitectura MVC**: rutas, controladores, modelos, servicios, vistas y assets separados.
- **Personalización por mascota**: preguntas opcionales para especie, tamaño, edad, comida comercial/medicada, condiciones, shampoo, lociones, accesorios y juguetes.
- **Recomendaciones**: prioriza productos según perfil de mascota y vistas.
- **Autenticación de clientes**: registro solo con Gmail, captcha básico, código temporal y contraseñas con hash.
- **Administrador seguro**: no se registra desde la web; se configura con `ADMIN_EMAIL` y `ADMIN_PASSWORD_HASH`.
- **Analítica**: guarda navegación, vistas, preferencias y carrito para panel administrativo.
- **Modo oscuro**: selector de tema con persistencia en `localStorage`.
- **Deploy-ready**: `railway.json`, `Procfile`, `/health`, `/ready`, `[::]:$PORT` y soporte `MYSQL_URL`/`DATABASE_URL`/variables `MYSQL*` de Railway.

## Requisitos

- Node.js 18 o superior.
- MySQL local o servicio MySQL en Railway.
- npm para instalar dependencias.

## Inicio rápido local

```bash
npm install
cp .env.example .env
npm start
```

La aplicación local queda en `http://localhost:3000` si no defines otra variable `PORT`.

## Variables principales

```bash
NODE_ENV=development
PORT=3000
MYSQL_URL=mysql://usuario:clave@host:puerto/base
DATABASE_URL=mysql://usuario:clave@host:puerto/base
MYSQL_PUBLIC_URL=mysql://usuario:clave@host-publico:puerto/base
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQL_DATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=clave-railway
MYSQL_ROOT_PASSWORD=clave-railway
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petmarket
DB_USER=root
DB_PASSWORD=password
DB_DIALECT=mysql
SESSION_SECRET=cambia-esto-por-una-clave-larga
SECURE_COOKIES=false
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=hash-generado-con-bcryptjs
DB_CONNECT_RETRIES=0
DB_CONNECT_RETRY_DELAY_MS=5000
DB_CONNECT_TIMEOUT_MS=20000
MYSQL_DNS_RESULT_ORDER=
DB_SYNC_ALTER=false
SESSION_TABLE_NAME=sessions
VERIFICATION_CODE_TTL_MINUTES=10
```

Localmente puedes usar variables separadas (`DB_HOST`, `DB_USER`, etc.). En Railway se recomienda usar `MYSQL_URL` como **Variable Reference dentro del servicio web**, por ejemplo `MYSQL_URL=${{MySQL.MYSQL_URL}}`. Si tu plugin no la muestra, usa `MYSQL_PUBLIC_URL` o variables separadas `MYSQLHOST=mysql.railway.internal`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER` y `MYSQLPASSWORD`. `mysql.railway.internal` solo funciona desde servicios del mismo proyecto/entorno de Railway; para conectarte desde tu PC usa la URL pública/TCP proxy.


## Crear/sincronizar modelos en MySQL

Antes de sincronizar, revisa que Railway no esté usando variables locales como `DB_HOST=localhost`:

```bash
npm run db:diagnose
```

Si los logs del servicio MySQL dicen `ready for connections`, MySQL ya arrancó; todavía debes confirmar que el servicio **web** tenga `MYSQL_URL=${{MySQL.MYSQL_URL}}` o las variables `MYSQLHOST/MYSQLPORT/MYSQLDATABASE/MYSQLUSER/MYSQLPASSWORD`.

La app crea las tablas automáticamente al iniciar con `sequelize.sync()`. Si quieres forzar la creación desde consola antes de abrir la web, ejecuta:

```bash
npm run db:sync
```

Para un prototipo en Railway, si ya existían tablas y necesitas aplicar nuevos índices/campos de los modelos, activa temporalmente `DB_SYNC_ALTER=true`, ejecuta un redeploy o `npm run db:sync`, valida `/ready` y luego vuelve a dejarlo en `false`.

Si configuraste `MYSQLHOST=mysql.railway.internal` y `/ready` sigue en rojo, revisa `databaseConfig.missingSeparateKeys`: debe quedar vacío. Si aparecen variables faltantes, agrégalas en el servicio web de Railway (no solo en el servicio MySQL). También revisa `lastDatabaseFailure.code` y `lastDatabaseFailure.advice`, que traducen errores como `ENOTFOUND`, `ETIMEDOUT`, `ECONNREFUSED`, `ER_ACCESS_DENIED_ERROR` y `ER_BAD_DB_ERROR` a una acción concreta. Aunque MySQL esté caído, la web permite navegar home, productos, login, registro y carrito en modo temporal; las acciones persistentes se habilitan cuando `databaseReady` pasa a `true`.

## Estructura del proyecto

```text
server.js                 # Arranque HTTP y conexión de base de datos
src/app.js                # Configuración principal de Express
src/config/               # Variables de app y base de datos
src/controllers/          # Controladores: home, auth, preferencias, carrito, admin
src/models/               # Modelos Sequelize para MySQL
src/routes/               # Rutas web de Express
src/services/             # Lógica de catálogo, sesión, seguridad y analítica
src/views/                # Vistas EJS y layout
public/css, public/js     # Estilos, modo oscuro y JavaScript del navegador
docs/                     # Documentación técnica y despliegue Railway
railway.json              # Configuración de deploy Railway
render.yaml               # Blueprint Render para el servicio web
Procfile                  # Proceso web compatible con servidores tipo Heroku/Railway/Render
```

## Pasos para desplegar en Railway

### 1. Subir el proyecto a GitHub

```bash
git add .
git commit -m "Preparar PetMarket para Railway"
git push origin main
```

### 2. Crear el proyecto en Railway

1. Entra a Railway.
2. Crea un proyecto nuevo.
3. Selecciona **Deploy from GitHub repo**.
4. Elige este repositorio.
5. Railway detectará Node.js con Nixpacks y usará `npm start` desde `railway.json`.

### 3. Añadir MySQL en Railway

1. Dentro del proyecto, agrega un nuevo servicio **MySQL**.
2. En el servicio web, crea una variable:

```bash
MYSQL_URL=${{MySQL.MYSQL_URL}}
```

Si tu Railway muestra otro nombre de servicio, cambia `MySQL` por el nombre real del plugin.

### 4. Configurar variables de producción

En el servicio web de Railway agrega:

```bash
NODE_ENV=production
SESSION_SECRET=una-clave-larga-aleatoria-y-privada
SECURE_COOKIES=true
MYSQL_URL=${{MySQL.MYSQL_URL}}
# Si no tienes MYSQL_URL, usa MYSQLHOST/MYSQLPORT/MYSQLDATABASE/MYSQLUSER/MYSQLPASSWORD
DB_CONNECT_RETRIES=0
DB_CONNECT_RETRY_DELAY_MS=5000
DB_CONNECT_TIMEOUT_MS=20000
MYSQL_DNS_RESULT_ORDER=
DB_SYNC_ALTER=false
SESSION_TABLE_NAME=sessions
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD_HASH=pega-aqui-el-hash-bcrypt
VERIFICATION_CODE_TTL_MINUTES=10
```

No configures `PORT`; Railway lo define automáticamente.

### 5. Generar contraseña del administrador

En tu computadora local, después de instalar dependencias:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu-clave-segura',12).then(console.log)"
```

Copia el resultado completo en `ADMIN_PASSWORD_HASH`. El administrador **no** se crea desde el registro público.

### 6. Desplegar y verificar

1. Railway ejecutará el build automáticamente.
2. Abre la URL pública generada.
3. Visita `/health`; debe responder `ok` con HTTP 200. Este endpoint no depende de MySQL ni sesiones para que Railway pueda pasar el healthcheck aunque la base todavía esté iniciando.

4. Visita `/ready`; debe responder `databaseReady: true` cuando MySQL ya esté conectado.
5. Registra un cliente con correo `@gmail.com`.
6. Revisa los logs del deploy para ver el código de verificación del prototipo.
7. Inicia sesión como administrador con `ADMIN_EMAIL` y la contraseña real usada para crear el hash.
8. Entra a `/admin` y valida métricas, gráficos y tabla de productos vistos.

## Comandos útiles

```bash
npm start          # Ejecuta el servidor
npm run dev        # Ejecuta con nodemon en desarrollo
npm test           # Revisa sintaxis JS del servidor, src y public
```

## Documentación adicional

- Guía completa de despliegue Railway: [`docs/DEPLOY_RAILWAY.md`](docs/DEPLOY_RAILWAY.md).
- Guía completa de despliegue Render: [`docs/DEPLOY_RENDER.md`](docs/DEPLOY_RENDER.md).
- Troubleshooting operativo Railway: [`docs/RAILWAY_TROUBLESHOOTING.md`](docs/RAILWAY_TROUBLESHOOTING.md).
- Arquitectura, controladores, servicios y flujos: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Seguridad incluida en el prototipo

- Registro solo para clientes con correo `@gmail.com`.
- Captcha matemático básico y código de verificación con expiración antes de crear la cuenta.
- Contraseñas y códigos guardados con `bcryptjs`.
- Rol administrador separado mediante variables de entorno.
- Registro de navegación, vistas, preferencias y carrito en MySQL mediante Sequelize.
- Middleware `helmet`, cookies `httpOnly`, soporte para cookies seguras en producción y separación por controladores/servicios.

## Recomendaciones para producción real

Antes de procesar compras reales o datos sensibles, agrega:

- Envío real de correos con SMTP, SendGrid, Mailgun, Amazon SES u otro proveedor transaccional.
- Protección CSRF para formularios POST.
- Rate limiting para login, registro y verificación.
- Migraciones Sequelize en lugar de depender solo de `sequelize.sync()`.
- Backups automáticos de MySQL.
- Pasarela de pago certificada.
- Políticas de privacidad, términos y cumplimiento de protección de datos.
- Observabilidad con logs estructurados y alertas.

## Solución rápida para Railway

Si ves `SequelizeConnectionRefusedError` o `ECONNREFUSED`, casi siempre significa que la app web está intentando conectar a `localhost` porque no recibió la URL/variables del MySQL de Railway. Solución:

1. En el servicio web, agrega `MYSQL_URL=${{MySQL.MYSQL_URL}}` usando **Add a Variable Reference**. No basta con que exista en el servicio MySQL.
2. Si no existe esa variable, agrega `MYSQL_PUBLIC_URL` o `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER` y `MYSQLPASSWORD` copiadas desde el servicio MySQL.
3. Revisa `/health`; debe devolver `ok` aunque MySQL esté iniciando.
4. Revisa `/ready`; debe devolver estado 200 cuando la base quede lista.
5. El servidor ya no se cae inmediatamente: arranca `/health` y reintenta conectar a MySQL según `DB_CONNECT_RETRIES`.


## Healthcheck Railway

Railway usa `/health` para validar red. Este endpoint está declarado antes de sesiones y antes de cualquier consulta MySQL, por eso devuelve `ok` aunque la base todavía esté iniciando. Para validar la base usa `/ready`; ese sí devuelve 503 hasta que MySQL conecte y Sequelize sincronice tablas.


## Incidentes de Railway / Build Machines

Si Railway muestra `Build Machines (Metal) - Investigating` o indica que los builds del plan Hobby están en cola, eso es una incidencia/capacidad de Railway y no un error del código. Revisa `https://status.railway.com/`, espera a que el incidente pase a Monitoring/Resolved y luego ejecuta **Redeploy**. Este repo incluye `nixpacks.toml` para instalar solo dependencias de producción con `npm install --omit=dev`, pero ninguna configuración del repositorio puede eliminar una cola global de Railway.


## Variables Railway que acepta la app

La app acepta `MYSQL_URL`, `MYSQL_PUBLIC_URL`, `DATABASE_URL`, `DATABASE_PUBLIC_URL`, `DB_URL`, variables separadas `MYSQLHOST`/`MYSQLPORT`/`MYSQLDATABASE`/`MYSQLUSER`/`MYSQLPASSWORD` y también alias como `MYSQL_DATABASE` y `MYSQL_ROOT_PASSWORD`. Puedes verificar qué configuración detectó visitando `/ready`; la respuesta muestra `databaseConfig` sin contraseña. Si `hasExplicitDatabaseConfig` aparece en `false` y `host` aparece como `localhost`, el servicio web no recibió variables MySQL: agrega una Variable Reference en Railway.


## Si `/ready` muestra `host: localhost` en Railway

Eso significa que el servicio web no recibió ninguna variable MySQL. Debes ir al servicio **web** en Railway, abrir **Variables**, usar **Add a Variable Reference** y crear `MYSQL_URL=${{MySQL.MYSQL_URL}}`. Si quieres usar la URL pública, crea `MYSQL_PUBLIC_URL=${{MySQL.MYSQL_PUBLIC_URL}}`. Después redeploy. La app ya detecta este caso y deja de spamear reintentos infinitos contra localhost en Railway.


## Despliegue en Render

El repo incluye `render.yaml` para crear el servicio web `petmarket-seguro-web` en Render. La app usa MySQL, por lo que en Render debes conectar un MySQL externo con `MYSQL_URL` en Environment Variables. Render define `PORT` automáticamente; la app ya escucha `[::]:$PORT`, expone `/health` para health checks y `/ready` para validar MySQL. Guía completa: [`docs/DEPLOY_RENDER.md`](docs/DEPLOY_RENDER.md).


## Corrección de datos y seed

El seed de productos ahora usa `findOrCreate` + `update`: crea productos nuevos y actualiza categoría, marca, especie, etapa, línea, tags y precio sin borrar las vistas acumuladas. Esto permite corregir datos del catálogo en cada deploy sin perder analítica.

## Checklist Railway final

1. En el servicio web crea `MYSQL_URL=${{MySQL.MYSQL_URL}}` como Variable Reference.
2. Si usas URL pública, crea `MYSQL_PUBLIC_URL=${{MySQL.MYSQL_PUBLIC_URL}}`.
3. Redeploy.
4. Abre `/ready`; revisa `presentUrlKeys`, `urlSource`, `hasExplicitDatabaseConfig` y que `host` ya no sea `localhost`.
5. Si `databaseReady` es `true`, el catálogo se sincronizó y el seed actualizó datos sin borrar vistas.
