import secrets
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr

from database import get_connection, initialize_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="GatePass API",
    description="QR-Based Event Check-In System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://getpass-eta.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AttendeeCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr


class CheckInRequest(BaseModel):
    pass_code: str = Field(min_length=1, max_length=100)


def attendee_to_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "pass_code": row["pass_code"],
        "checked_in": bool(row["checked_in"]),
        "checked_in_at": row["checked_in_at"],
        "created_at": row["created_at"],
    }


def generate_pass_code(connection):
    while True:
        code = "GP-" + secrets.token_hex(4).upper()
        exists = connection.execute(
            "SELECT 1 FROM attendees WHERE pass_code = ?",
            (code,),
        ).fetchone()

        if not exists:
            return code


@app.get("/")
def home():
    return {"message": "Welcome to GatePass API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/attendees", status_code=201)
def register_attendee(attendee: AttendeeCreate):
    name = attendee.name.strip()
    email = str(attendee.email).strip().lower()

    if not name:
        raise HTTPException(status_code=422, detail="Name is required")

    try:
        with get_connection() as connection:
            pass_code = generate_pass_code(connection)

            cursor = connection.execute(
                """
                INSERT INTO attendees (name, email, pass_code)
                VALUES (?, ?, ?)
                """,
                (name, email, pass_code),
            )

            row = connection.execute(
                "SELECT * FROM attendees WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()

            return attendee_to_dict(row)

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered",
        )


@app.get("/api/attendees")
def list_attendees():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM attendees ORDER BY id DESC"
        ).fetchall()

        return [attendee_to_dict(row) for row in rows]


@app.get("/api/stats")
def get_stats():
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT
                COUNT(*) AS total_registered,
                COALESCE(SUM(checked_in), 0) AS checked_in
            FROM attendees
            """
        ).fetchone()

        total = row["total_registered"]
        checked_in = row["checked_in"]

        return {
            "total_registered": total,
            "checked_in": checked_in,
            "remaining": total - checked_in,
        }


@app.post("/api/check-in")
def check_in(request: CheckInRequest):
    code = request.pass_code.strip().upper()

    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE attendees
            SET checked_in = 1,
                checked_in_at = CURRENT_TIMESTAMP
            WHERE pass_code = ?
              AND checked_in = 0
            """,
            (code,),
        )

        if cursor.rowcount == 1:
            row = connection.execute(
                "SELECT * FROM attendees WHERE pass_code = ?",
                (code,),
            ).fetchone()

            return {
                "status": "success",
                "message": "Check-in successful",
                "attendee": attendee_to_dict(row),
            }

        row = connection.execute(
            "SELECT * FROM attendees WHERE pass_code = ?",
            (code,),
        ).fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail="Invalid pass code",
            )

        raise HTTPException(
            status_code=409,
            detail="This pass has already been checked in",
        )
