import csv
import os
import re
from datetime import datetime, timezone

from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
DEFAULT_DB_URL = os.environ.get("DATABASE_URL", "sqlite:///waitlist.db")
ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "*")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DEFAULT_DB_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})


class WaitlistEntry(db.Model):
    __tablename__ = "waitlist_entries"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )


@app.post("/api/waitlist")
def create_waitlist_entry():
    payload = request.get_json(silent=True) or request.form
    email = (payload.get("email") or "").strip().lower()

    if not EMAIL_REGEX.match(email):
        return jsonify({"message": "Please provide a valid email."}), 400

    existing = WaitlistEntry.query.filter_by(email=email).one_or_none()
    if existing:
        return (
            jsonify(
                {
                    "message": "Looks like you're already on the list.",
                    "duplicate": True,
                    "data": serialize_entry(existing),
                }
            ),
            200,
        )

    entry = WaitlistEntry(email=email)
    db.session.add(entry)
    db.session.commit()

    return jsonify({"message": "Added to waitlist!", "data": serialize_entry(entry)}), 201


@app.get("/api/waitlist")
def list_waitlist_entries():
    limit = min(int(request.args.get("limit", 250)), 1000)
    entries = (
        WaitlistEntry.query.order_by(WaitlistEntry.created_at.desc())
        .limit(limit)
        .all()
    )

    return jsonify([serialize_entry(entry) for entry in entries])


@app.get("/waitlist.csv")
def waitlist_csv():
    entries = WaitlistEntry.query.order_by(WaitlistEntry.created_at.desc()).all()

    def generate():
        output = []
        writer = csv.writer(output)
        header = ["email", "created_at"]
        writer.writerow(header)
        yield "".join(output)

        for entry in entries:
            output = []
            writer = csv.writer(output)
            writer.writerow([entry.email, entry.created_at.isoformat()])
            yield "".join(output)

    return Response(generate(), mimetype="text/csv")


@app.get("/healthz")
def healthcheck():
    return jsonify({"status": "ok"}), 200


def serialize_entry(entry: WaitlistEntry):
    return {
        "email": entry.email,
        "createdAt": entry.created_at.isoformat(),
    }


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))


