import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "disaster_vision.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        region TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        active INTEGER DEFAULT 1
    )
    """)
    
    # Create Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disaster_type TEXT NOT NULL,
        input_params TEXT NOT NULL,
        confidence REAL NOT NULL,
        risk_percentage REAL NOT NULL,
        severity TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)
    
    # Create Training Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS training_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disaster_type TEXT NOT NULL,
        accuracy REAL NOT NULL,
        model_path TEXT NOT NULL,
        features TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)
    
    # Check if empty, then seed default data
    cursor.execute("SELECT COUNT(*) FROM alerts")
    if cursor.fetchone()[0] == 0:
        seed_data = [
            ("Cyclone", "Critical", "Bay of Bengal (Odisha Coast)", "Super Cyclone 'Amphan II' forming. Sustained wind speeds exceeding 210 km/h. Evacuation active for coastal lowlands.", datetime.now().isoformat(), 1),
            ("Wildfire", "High", "Western Ghats Forest Zone (Maharashtra)", "Forest fires detected in Western Ghats deciduous slopes due to dry heatwave and 43°C temperatures.", datetime.now().isoformat(), 1),
            ("Earthquake", "Moderate", "Kachchh Seismic Fault (Bhuj, Gujarat)", "M 5.8 earthquake registered along the Kachchh rift zone. Pre-shocks detected, structural inspections advised.", datetime.now().isoformat(), 1),
            ("Flood", "High", "Brahmaputra Basin (Assam)", "River levels breached critical thresholds in Assam. Intense monsoonal downpours (420mm) expected over 48 hours.", datetime.now().isoformat(), 1),
            ("Landslide", "Moderate", "Himalayan Landslide Belt (Uttarakhand)", "Monsoon rains triggered slope saturation at 94% on Uttarakhand highway corridors. High debris flow warnings active.", datetime.now().isoformat(), 1)
        ]
        cursor.executemany("""
        INSERT INTO alerts (type, severity, region, message, timestamp, active)
        VALUES (?, ?, ?, ?, ?, ?)
        """, seed_data)
        conn.commit()
        
    conn.close()

def get_active_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE active = 1 ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    alerts = [dict(row) for row in rows]
    conn.close()
    return alerts

def add_alert(disaster_type, severity, region, message):
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO alerts (type, severity, region, message, timestamp, active)
    VALUES (?, ?, ?, ?, ?, 1)
    """, (disaster_type, severity, region, message))
    conn.commit()
    alert_id = cursor.lastrowid
    conn.close()
    return alert_id

def log_prediction(disaster_type, input_params, confidence, risk_percentage, severity):
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO predictions (disaster_type, input_params, confidence, risk_percentage, severity, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (disaster_type, json.dumps(input_params), confidence, risk_percentage, severity, timestamp))
    conn.commit()
    conn.close()

def get_prediction_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 20")
    rows = cursor.fetchall()
    history = []
    for row in rows:
        d = dict(row)
        d['input_params'] = json.loads(d['input_params'])
        history.append(d)
    conn.close()
    return history

def log_training(disaster_type, accuracy, model_path, features):
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO training_logs (disaster_type, accuracy, model_path, features, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (disaster_type, accuracy, model_path, json.dumps(features), timestamp))
    conn.commit()
    conn.close()

def get_training_logs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM training_logs ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    logs = []
    for row in rows:
        d = dict(row)
        d['features'] = json.loads(d['features'])
        logs.append(d)
    conn.close()
    return logs
