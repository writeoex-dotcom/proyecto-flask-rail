from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="cliente", nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(180), nullable=False, index=True)
    code_hash = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    consumed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class PetPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    session_key = db.Column(db.String(120), nullable=True, index=True)
    size = db.Column(db.String(40))
    species = db.Column(db.String(40))
    age_range = db.Column(db.String(40))
    life_stage = db.Column(db.String(40))
    food_line = db.Column(db.String(40))
    medical_condition = db.Column(db.String(80))
    shampoo_brand = db.Column(db.String(80))
    coat_condition = db.Column(db.String(80))
    lotion_skin_sensitivity = db.Column(db.String(80))
    toy_size = db.Column(db.String(40))
    toy_hardness = db.Column(db.String(40))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(60), nullable=False)
    brand = db.Column(db.String(80), nullable=False)
    species = db.Column(db.String(40), nullable=False)
    life_stage = db.Column(db.String(40), nullable=False)
    line_type = db.Column(db.String(40), nullable=False)
    tags = db.Column(db.String(255), default="")
    price = db.Column(db.Numeric(10, 2), nullable=False)
    views = db.Column(db.Integer, default=0, nullable=False)


class NavigationEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    session_key = db.Column(db.String(120), nullable=False, index=True)
    event_type = db.Column(db.String(60), nullable=False)
    payload = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    status = db.Column(db.String(30), default="carrito", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
