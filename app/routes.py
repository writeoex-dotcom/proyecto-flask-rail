from datetime import datetime, timedelta
import json
import random
import re
import secrets

from flask import Blueprint, current_app, flash, redirect, render_template, request, session, url_for
from sqlalchemy import func
from werkzeug.security import check_password_hash, generate_password_hash

from .data import BRANDS, PRODUCTS
from .models import CartItem, NavigationEvent, PetPreference, Product, User, VerificationCode, db

main_bp = Blueprint("main", __name__)
GMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@gmail\.com$")


def session_key():
    if "session_key" not in session:
        session["session_key"] = secrets.token_urlsafe(24)
    return session["session_key"]


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return db.session.get(User, user_id)


def log_event(event_type, payload):
    user = current_user()
    event = NavigationEvent(
        user_id=user.id if user else None,
        session_key=session_key(),
        event_type=event_type,
        payload=json.dumps(payload, ensure_ascii=False),
    )
    db.session.add(event)
    db.session.commit()


def seed_products():
    if Product.query.count() == 0:
        for name, category, brand, species, life_stage, line_type, tags, price in PRODUCTS:
            db.session.add(
                Product(
                    name=name,
                    category=category,
                    brand=brand,
                    species=species,
                    life_stage=life_stage,
                    line_type=line_type,
                    tags=tags,
                    price=price,
                )
            )
        db.session.commit()


def recommended_products(preference):
    query = Product.query
    if preference and preference.species:
        query = query.order_by((Product.species == preference.species).desc())
    if preference and preference.life_stage:
        query = query.order_by((Product.life_stage == preference.life_stage).desc())
    if preference and preference.food_line:
        query = query.order_by((Product.line_type == preference.food_line).desc())
    return query.order_by(Product.views.desc(), Product.name.asc()).limit(12).all()


@main_bp.before_app_request
def prepare():
    session_key()
    seed_products()


@main_bp.context_processor
def inject_user():
    return {"current_user": current_user(), "brands": BRANDS}


@main_bp.route("/")
def home():
    preference = PetPreference.query.filter_by(session_key=session_key()).first()
    products = recommended_products(preference)
    log_event("home_view", {"path": "/"})
    return render_template("home.html", products=products, preference=preference)


@main_bp.route("/product/<int:product_id>")
def product_detail(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        flash("Producto no encontrado.", "danger")
        return redirect(url_for("main.home"))
    product.views += 1
    db.session.commit()
    log_event("product_view", {"product_id": product.id, "name": product.name})
    return render_template("product.html", product=product)


@main_bp.route("/preferences", methods=["POST"])
def preferences():
    preference = PetPreference.query.filter_by(session_key=session_key()).first()
    if not preference:
        preference = PetPreference(session_key=session_key(), user_id=session.get("user_id"))
        db.session.add(preference)
    preference.size = request.form.get("size") or preference.size
    preference.species = request.form.get("species") or preference.species
    preference.age_range = request.form.get("age_range") or preference.age_range
    age_map = {"menos_1": "cachorro", "1_6": "adulto", "mas_6": "adulto mayor"}
    if preference.age_range:
        preference.life_stage = age_map.get(preference.age_range, preference.life_stage)
    preference.food_line = request.form.get("food_line") or preference.food_line
    preference.medical_condition = request.form.get("medical_condition") or preference.medical_condition
    preference.shampoo_brand = request.form.get("shampoo_brand") or preference.shampoo_brand
    preference.coat_condition = request.form.get("coat_condition") or preference.coat_condition
    preference.lotion_skin_sensitivity = request.form.get("skin_sensitivity") or preference.lotion_skin_sensitivity
    preference.toy_size = request.form.get("toy_size") or preference.toy_size
    preference.toy_hardness = request.form.get("toy_hardness") or preference.toy_hardness
    db.session.commit()
    log_event("preference_update", request.form.to_dict())
    flash("Preferencias de mascota actualizadas.", "success")
    return redirect(url_for("main.home"))


@main_bp.route("/register", methods=["GET", "POST"])
def register():
    a = random.randint(1, 9)
    b = random.randint(1, 9)
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        captcha_answer = request.form.get("captcha_answer", "")
        expected = session.get("captcha_expected")
        if str(expected) != captcha_answer:
            flash("Captcha incorrecto. Inténtalo de nuevo.", "danger")
        elif not GMAIL_RE.match(email):
            flash("Solo se permiten correos @gmail.com.", "danger")
        elif len(password) < 8:
            flash("La contraseña debe tener mínimo 8 caracteres.", "danger")
        elif User.query.filter_by(email=email).first():
            flash("Este correo ya está registrado.", "warning")
        else:
            code = f"{random.randint(100000, 999999)}"
            ttl = current_app.config["VERIFICATION_CODE_TTL_MINUTES"]
            db.session.add(
                VerificationCode(
                    email=email,
                    code_hash=generate_password_hash(code),
                    expires_at=datetime.utcnow() + timedelta(minutes=ttl),
                )
            )
            session["pending_registration"] = {"email": email, "password_hash": generate_password_hash(password)}
            db.session.commit()
            current_app.logger.warning("Código de verificación para %s: %s", email, code)
            flash("En desarrollo el código aparece en logs del servidor. En producción conecte SMTP Gmail/SendGrid.", "info")
            return redirect(url_for("main.verify"))
    session["captcha_expected"] = a + b
    return render_template("register.html", a=a, b=b)


@main_bp.route("/verify", methods=["GET", "POST"])
def verify():
    pending = session.get("pending_registration")
    if not pending:
        flash("Primero inicia el registro.", "warning")
        return redirect(url_for("main.register"))
    if request.method == "POST":
        code = request.form.get("code", "")
        record = VerificationCode.query.filter_by(email=pending["email"], consumed=False).order_by(VerificationCode.created_at.desc()).first()
        if not record or record.expires_at < datetime.utcnow():
            flash("Código expirado o inexistente.", "danger")
        elif not check_password_hash(record.code_hash, code):
            flash("Código incorrecto.", "danger")
        else:
            record.consumed = True
            user = User(email=pending["email"], password_hash=pending["password_hash"], role="cliente", email_verified=True)
            db.session.add(user)
            db.session.commit()
            session.pop("pending_registration", None)
            session["user_id"] = user.id
            flash("Cuenta cliente creada y verificada.", "success")
            return redirect(url_for("main.home"))
    return render_template("verify.html", email=pending["email"])


@main_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()
        admin_email = current_app.config["ADMIN_EMAIL"]
        admin_hash = current_app.config["ADMIN_PASSWORD_HASH"]
        if email == admin_email and admin_hash and check_password_hash(admin_hash, password):
            session["admin"] = True
            flash("Bienvenido administrador.", "success")
            return redirect(url_for("main.admin"))
        if not user or not check_password_hash(user.password_hash, password):
            flash("Credenciales inválidas.", "danger")
        else:
            session["user_id"] = user.id
            session.pop("admin", None)
            log_event("login", {"email": email})
            flash("Sesión iniciada.", "success")
            return redirect(url_for("main.home"))
    return render_template("login.html")


@main_bp.route("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada.", "info")
    return redirect(url_for("main.home"))


@main_bp.route("/cart/add/<int:product_id>", methods=["POST"])
def add_cart(product_id):
    user = current_user()
    if not user:
        flash("El carrito de compra es solo para cuentas verificadas.", "warning")
        return redirect(url_for("main.login"))
    product = db.session.get(Product, product_id)
    if not product:
        flash("Producto no encontrado.", "danger")
        return redirect(url_for("main.home"))
    db.session.add(CartItem(user_id=user.id, product_id=product.id, quantity=1))
    db.session.commit()
    log_event("cart_add", {"product_id": product.id})
    flash("Producto agregado al carrito.", "success")
    return redirect(url_for("main.cart"))


@main_bp.route("/cart")
def cart():
    user = current_user()
    if not user:
        flash("Debes iniciar sesión para ver el carrito.", "warning")
        return redirect(url_for("main.login"))
    items = db.session.query(CartItem, Product).join(Product, Product.id == CartItem.product_id).filter(CartItem.user_id == user.id).all()
    return render_template("cart.html", items=items)


@main_bp.route("/admin")
def admin():
    if not session.get("admin"):
        flash("Acceso solo para el correo administrador configurado.", "danger")
        return redirect(url_for("main.login"))
    event_counts = db.session.query(NavigationEvent.event_type, func.count(NavigationEvent.id)).group_by(NavigationEvent.event_type).all()
    category_views = db.session.query(Product.category, func.sum(Product.views)).group_by(Product.category).all()
    top_products = Product.query.order_by(Product.views.desc()).limit(10).all()
    users_count = User.query.count()
    carts_count = CartItem.query.count()
    return render_template(
        "admin.html",
        event_counts=event_counts,
        category_views=category_views,
        top_products=top_products,
        users_count=users_count,
        carts_count=carts_count,
    )
