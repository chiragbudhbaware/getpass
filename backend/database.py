import os
import sqlite3
from pathlib import Path

# Use a deployment-configured path when available.
# Otherwise, keep using the existing local database file.
DEFAULT_DATABASE_PATH = Path(__file__).resolve().parent / "gatepass.db"

DATABASE_PATH = Path(
    os.getenv("GATEPASS_DATABASE_PATH", str(DEFAULT_DATABASE_PATH))
).resolve()


def get_connection():
    # Ensure the database directory exists.
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA busy_timeout = 10000")

    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS attendees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                pass_code TEXT NOT NULL UNIQUE,
                checked_in INTEGER NOT NULL DEFAULT 0,
                checked_in_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
