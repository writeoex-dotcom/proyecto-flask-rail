from flask import Flask
from .models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")
    db.init_app(app)

    from .routes import main_bp

    app.register_blueprint(main_bp)

    with app.app_context():
        db.create_all()

    return app
