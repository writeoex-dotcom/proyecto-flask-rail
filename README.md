# PetMarket Seguro

Prototipo Flask inspirado en la estructura de un e-commerce de mascotas: home con banner, navegación, accesos rápidos, carrito para clientes verificados, personalización por huella y panel administrador con analítica.

## Configuración

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='mysql+pymysql://usuario:clave@localhost:3306/petmarket'
export SECRET_KEY='cambia-esto'
export ADMIN_EMAIL='admin@gmail.com'
export ADMIN_PASSWORD_HASH='hash-generado-con-werkzeug'
flask --app run run
```

Para generar `ADMIN_PASSWORD_HASH`:

```bash
python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('tu-clave-segura'))"
```

## Seguridad incluida en el prototipo

- Registro solo para clientes con correo `@gmail.com`.
- Captcha matemático básico y código de verificación con expiración antes de crear la cuenta.
- Contraseñas y códigos guardados con hash.
- Rol administrador separado: no se registra desde la web, se habilita por variables de entorno.
- Registro de navegación, vistas y carrito en MySQL mediante SQLAlchemy.

En producción se debe conectar un proveedor SMTP real, activar HTTPS, cookies seguras, rate limiting, backups cifrados, auditoría de pagos y cumplimiento de protección de datos.
