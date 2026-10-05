import os
import sqlite3
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "zeroscraps.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create listings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS listings (
            id TEXT PRIMARY KEY,
            food TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            location TEXT,
            distance_km REAL,
            urgency TEXT DEFAULT 'MEDIUM',
            recommended_action TEXT DEFAULT 'SELL',
            current_price REAL,
            suggested_price REAL,
            currency TEXT DEFAULT 'INR',
            suggested_discount_percent REAL,
            harvest_date TEXT,
            production_date TEXT,
            expiry_date TEXT,
            best_before_date TEXT,
            reason TEXT,
            confidence REAL,
            remaining_shelf_life_days INTEGER,
            status TEXT DEFAULT 'AVAILABLE',
            claimed_by TEXT,
            claimed_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create claims table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS claims (
            id TEXT PRIMARY KEY,
            listing_id TEXT NOT NULL,
            buyer_id TEXT NOT NULL,
            status TEXT DEFAULT 'CLAIMED',
            claimed_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (listing_id) REFERENCES listings (id)
        )
    """)

    conn.commit()

    # Seed initial demo listings if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM listings")
    count = cursor.fetchone()["cnt"]
    if count == 0:
        _seed_initial_listings(cursor)
        conn.commit()

    conn.close()

def _seed_initial_listings(cursor):
    now = datetime.now(timezone.utc).isoformat()
    seed_listings = [
        (
            "listing_101",
            "Fresh Tomatoes",
            100.0,
            "kg",
            "Koyambedu Wholesale Market, Chennai",
            4.2,
            "HIGH",
            "SELL",
            40.0,
            35.0,
            "INR",
            12.5,
            "2026-10-04",
            None,
            "2026-10-10",
            None,
            "Harvested yesterday and prompt sale maximizes value retention.",
            0.88,
            6,
            "AVAILABLE",
            None,
            None,
            now
        ),
        (
            "listing_102",
            "Basmati Rice Bags",
            250.0,
            "kg",
            "Madhavaram Grain Market, Chennai",
            8.5,
            "MEDIUM",
            "DISCOUNT",
            60.0,
            48.0,
            "INR",
            20.0,
            "2026-09-15",
            None,
            "2026-10-20",
            None,
            "Slow demand detected; 20% discount will accelerate sale before expiration.",
            0.92,
            15,
            "AVAILABLE",
            None,
            None,
            now
        ),
        (
            "listing_103",
            "Organic Apples",
            50.0,
            "kg",
            "T. Nagar Depot, Chennai",
            2.1,
            "CRITICAL",
            "SELL",
            120.0,
            95.0,
            "INR",
            20.8,
            "2026-09-28",
            None,
            "2026-10-07",
            None,
            "High moisture fruit near optimal freshness window.",
            0.95,
            2,
            "AVAILABLE",
            None,
            None,
            now
        ),
        (
            "listing_104",
            "Surplus Cooked Meals",
            30.0,
            "boxes",
            "Velachery Community Kitchen, Chennai",
            None,  # Intentionally null to test UI handling missing distance
            "HIGH",
            "DONATE",
            0.0,
            0.0,
            "INR",
            None,
            "2026-10-05",
            "2026-10-05",
            "2026-10-05",
            None,
            "Prepared surplus meals suitable for immediate community donation.",
            0.90,
            1,
            "AVAILABLE",
            None,
            None,
            now
        ),
        (
            "listing_105",
            "Ripe Mangoes",
            80.0,
            "kg",
            "Tambaram Fruit Hub, Chennai",
            12.0,
            "HIGH",
            "PROCESS",
            50.0,
            30.0,
            "INR",
            40.0,
            "2026-09-25",
            None,
            "2026-10-08",
            None,
            "Overripe fruit ideal for pulp/jam processing.",
            0.85,
            3,
            "AVAILABLE",
            None,
            None,
            now
        )
    ]

    cursor.executemany("""
        INSERT INTO listings (
            id, food, quantity, unit, location, distance_km, urgency,
            recommended_action, current_price, suggested_price, currency,
            suggested_discount_percent, harvest_date, production_date, expiry_date,
            best_before_date, reason, confidence, remaining_shelf_life_days, status,
            claimed_by, claimed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, seed_listings)

def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    if row is None:
        return None
    return dict(row)

# Run init_db when module is imported
init_db()
