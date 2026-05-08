# Railway troubleshooting operativo

Esta guía separa problemas de **plataforma Railway** de problemas de **la aplicación PetMarket Seguro**.

## 1. Cuando Railway muestra “Build Machines (Metal) - Investigating”

Si el panel de Railway muestra un incidente como:

```text
Build Machines (Metal)
Investigating
Builds on the Hobby plan queue and take longer than normal to start.
```

entonces el despliegue puede quedarse en cola aunque el código esté correcto. En ese caso:

1. Revisa `https://status.railway.com/`.
2. Si hay incidente activo en Builds, Build Machines o Image Registry, espera a que pase a Monitoring/Resolved.
3. No hagas cambios de código solo para “destrabar” la cola.
4. Cuando Railway indique recuperación, usa **Redeploy** en el último despliegue o empuja un commit mínimo.
5. Si el build empieza pero falla en logs de Node/MySQL, entonces sí revisa `/health`, `/ready` y variables de entorno.

## 2. Cómo distinguir el tipo de fallo

| Fase Railway | Qué significa | Acción recomendada |
| --- | --- | --- |
| Initialization | Railway toma snapshot del repo | Revisa tamaño del repo y archivos innecesarios |
| Build | Instala dependencias y crea imagen | Revisa logs de `npm install`; este repo usa `npm install --omit=dev` en `nixpacks.toml` |
| Deploy | Crea y arranca contenedor | Revisa logs de `node server.js` |
| Network / Healthcheck | Railway llama `/health` | Debe responder `ok`; no depende de MySQL |
| Post-deploy | Drena despliegue anterior | Normalmente no requiere acción |

## 3. Checklist rápido para PetMarket Seguro

- `/health` responde `ok`: el servidor Express está vivo.
- `/ready` responde `databaseReady: true`: MySQL conectó y Sequelize sincronizó.
- `/ready` responde 503: revisa `MYSQL_URL` o variables `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`.
- Build en cola sin logs: probablemente incidente/capacidad Railway, especialmente en Hobby/Trial.
- Build con error de `npm`: revisa `package.json`, `nixpacks.toml` y logs de instalación.

## 4. Por qué se agregó `nixpacks.toml`

`nixpacks.toml` fuerza una instalación de producción:

```bash
npm install --omit=dev
```

Esto evita instalar herramientas de desarrollo como `nodemon` en Railway y reduce el trabajo cuando el build finalmente entra a una máquina disponible. No elimina las colas causadas por incidentes de Railway, pero sí hace más limpio y predecible el build de la app.


## MYSQLHOST=mysql.railway.internal no conecta

- Confirma que las variables estén en el servicio web, no solo en el servicio MySQL: `MYSQLHOST=mysql.railway.internal`, `MYSQLPORT=3306`, `MYSQLDATABASE=railway`, `MYSQLUSER=root` y `MYSQLPASSWORD`.
- `mysql.railway.internal` solo funciona dentro del mismo proyecto y entorno de Railway. Desde local usa `MYSQL_PUBLIC_URL`/TCP Proxy.
- Revisa `/ready`: debe mostrar `usesRailwayInternalHost: true`, `dnsResultOrder`, `presentSeparateKeys` con las variables recibidas y `missingSeparateKeys: []`. Si `databaseReady` sigue en `false`, usa `lastDatabaseFailure.code` y `lastDatabaseFailure.advice` para distinguir DNS, timeout, credenciales o base inexistente.
- Mientras `databaseReady` está en `false`, puedes navegar el catálogo y páginas principales en modo temporal; registro, carrito persistente y admin quedan completos cuando MySQL conecta.
- Si las tablas no existen, espera a que `/ready` pase a `databaseReady: true` o ejecuta `npm run db:sync`. Para actualizar modelos existentes usa temporalmente `DB_SYNC_ALTER=true`.

## Conectar MySQL paso a paso en Railway

### Opción recomendada: URL completa

En el servicio **web** agrega una Variable Reference:

```bash
MYSQL_URL=${{MySQL.MYSQL_URL}}
```

Después haz **Redeploy** y abre `/ready`. Debe mostrar:

```json
{
  "databaseReady": true,
  "databaseConfig": {
    "usingUrl": true,
    "urlSource": "MYSQL_URL",
    "configurationWarnings": []
  }
}
```

### Opción alternativa: variables separadas

Si no usas `MYSQL_URL`, en el servicio **web** agrega todas estas variables:

```bash
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
```

No copies al servicio web los valores locales del `.env.example` (`DB_HOST=localhost`, `DB_NAME=petmarket`, `DB_PASSWORD=password`) porque Railway intentará conectarse a `localhost` dentro del contenedor web y fallará.

### Diagnóstico rápido

Ejecuta en Railway Shell o local después de instalar dependencias:

```bash
npm run db:diagnose
```

También revisa `/ready`:

- `host: "localhost"` en Railway = falta `MYSQL_URL` o `MYSQLHOST`.
- `configurationWarnings` con mensajes = corrige esas variables antes de redeploy.
- `missingSeparateKeys` debe ser `[]` si usas variables separadas.
- `usesRailwayInternalHost: true` confirma que `MYSQLHOST=mysql.railway.internal` fue tomado.
