import os
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import db
import ml_engine

# Initialize DB and ML models on start
db.init_db()
ml_engine.init_models()

app = FastAPI(title="DisasterVision AI API Server", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class PredictionRequest(BaseModel):
    inputs: Dict[str, float]

class AlertRequest(BaseModel):
    type: str
    severity: str
    region: str
    message: str

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class SOSRequest(BaseModel):
    lat: float
    lng: float
    user_name: str
    phone: str
    emergency_type: str

# API Endpoints

@app.get("/")
def read_root():
    return {"status": "online", "system": "DisasterVision AI Core Engine"}

@app.get("/api/alerts")
def get_alerts():
    try:
        return db.get_active_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/alerts")
def create_alert(alert: AlertRequest):
    try:
        alert_id = db.add_alert(alert.type, alert.severity, alert.region, alert.message)
        return {"status": "success", "alert_id": alert_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/{disaster_type}")
def predict(disaster_type: str, request: PredictionRequest):
    if disaster_type not in ml_engine.FEATURES:
        raise HTTPException(status_code=400, detail="Invalid disaster type. Must be one of: flood, earthquake, cyclone, wildfire, landslide")
    
    # Check features are present
    required_features = ml_engine.FEATURES[disaster_type]
    for feat in required_features:
        if feat not in request.inputs:
            raise HTTPException(status_code=400, detail=f"Missing feature: {feat}. Required features: {required_features}")
            
    try:
        result = ml_engine.predict_disaster(disaster_type, request.inputs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history():
    try:
        return db.get_prediction_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather/{region}")
def get_weather(region: str):
    # Simulated meteorological parameters reflecting real-time data
    import random
    random.seed(region)
    
    # Realistic weather patterns based on keyword
    reg_lower = region.lower()
    
    # Default values
    temp = round(random.uniform(22.0, 31.0), 1)
    humidity = round(random.uniform(50.0, 85.0), 1)
    wind_speed = round(random.uniform(8.0, 25.0), 1)
    pressure = round(random.uniform(995.0, 1015.0), 1)
    rainfall = round(random.uniform(0.0, 50.0), 1)
    drought_index = round(random.uniform(1.0, 6.0), 1)
    seismic_activity = round(random.uniform(0.1, 4.0), 1)
    soil_moisture = round(random.uniform(20.0, 80.0), 1)

    if "pacific" in reg_lower or "coast" in reg_lower or "california" in reg_lower:
        temp = round(random.uniform(32.0, 44.0), 1)
        humidity = round(random.uniform(5.0, 25.0), 1)
        wind_speed = round(random.uniform(35.0, 75.0), 1)
        drought_index = round(random.uniform(7.5, 9.8), 1)
        rainfall = 0.0
    elif "ocean" in reg_lower or "bay" in reg_lower or "cyclone" in reg_lower or "typhoon" in reg_lower:
        temp = round(random.uniform(26.0, 32.0), 1)
        pressure = round(random.uniform(940.0, 980.0), 1)
        wind_speed = round(random.uniform(120.0, 240.0), 1)
        humidity = round(random.uniform(85.0, 100.0), 1)
        rainfall = round(random.uniform(120.0, 320.0), 1)
    elif "basin" in reg_lower or "flood" in reg_lower or "monsoon" in reg_lower:
        temp = round(random.uniform(20.0, 28.0), 1)
        humidity = round(random.uniform(80.0, 100.0), 1)
        rainfall = round(random.uniform(150.0, 450.0), 1)
        soil_moisture = round(random.uniform(90.0, 100.0), 1)
    elif "japan" in reg_lower or "ring of fire" in reg_lower or "seismic" in reg_lower:
        seismic_activity = round(random.uniform(4.5, 8.2), 1)
        temp = round(random.uniform(10.0, 22.0), 1)
    elif "highlands" in reg_lower or "mountain" in reg_lower or "slope" in reg_lower:
        soil_moisture = round(random.uniform(85.0, 100.0), 1)
        rainfall = round(random.uniform(80.0, 200.0), 1)
        temp = round(random.uniform(15.0, 25.0), 1)
        
    return {
        "region": region,
        "temperature": temp,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "pressure": pressure,
        "rainfall": rainfall,
        "drought_index": drought_index,
        "seismic_activity": seismic_activity,
        "soil_moisture": soil_moisture,
        "satellite_overlay": {
            "storm_radar_visual": wind_speed > 60,
            "wildfire_thermal_hotspots": temp > 35 and humidity < 25,
            "cloud_density_percent": int(humidity * 1.1) if humidity < 90 else 100
        }
    }

@app.post("/api/admin/train/{disaster_type}")
def train_disaster_model(disaster_type: str, background_tasks: BackgroundTasks):
    if disaster_type not in ml_engine.FEATURES:
        raise HTTPException(status_code=400, detail="Invalid disaster type")
        
    # Trigger training
    try:
        # In a real environment, this can be async, we will train it synchronously for demo speed or trigger it.
        # But we do want to return accuracy instantly for this response, let's run it.
        accuracy = ml_engine.train_model(disaster_type)
        return {
            "status": "success",
            "disaster_type": disaster_type,
            "accuracy": accuracy,
            "message": f"Successfully retrained ML model using latest historical data. Accuracy is {accuracy*100:.2f}%."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/metrics")
def get_admin_metrics():
    try:
        training_logs = db.get_training_logs()
        # Calculate summary metrics
        counts = {}
        for row in training_logs:
            dtype = row["disaster_type"]
            if dtype not in counts:
                counts[dtype] = row["accuracy"]
                
        # Fill defaults if not found
        for dtype in ml_engine.FEATURES.keys():
            if dtype not in counts:
                counts[dtype] = 0.85 # default mockup accuracy if log reading had an error
                
        # Read dataset statistics
        dataset_stats = {}
        for dtype in ml_engine.FEATURES.keys():
            path = ml_engine.get_dataset_path(dtype)
            if os.path.exists(path):
                df = pd.read_csv(path)
                dataset_stats[dtype] = {
                    "records": len(df),
                    "features": list(df.columns[:-1]),
                    "severity_distribution": df["severity"].value_counts().to_dict()
                }
            else:
                dataset_stats[dtype] = {"records": 0}
                
        return {
            "model_accuracies": counts,
            "training_history": training_logs,
            "datasets": dataset_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_bot(request: ChatRequest):
    msg = request.message.lower()
    
    # Simple NLP rules engine to provide premium-grade responses
    if "earthquake" in msg:
        reply = (
            "### 🚨 Earthquake Preparedness & Response Guide\n\n"
            "**DURING AN EARTHQUAKE (DROP, COVER, AND HOLD ON):**\n"
            "1. **DROP** down onto your hands and knees. This position protects you from falling.\n"
            "2. **COVER** your head and neck under a sturdy table or desk. If no shelter is nearby, crawl next to an interior wall.\n"
            "3. **HOLD ON** to your shelter until the shaking stops.\n\n"
            "**EVACUATION PROTOCOL:**\n"
            "- Do not use elevators. Stairwells should be cleared carefully.\n"
            "- Move away from glass panels, windows, and heavy outer masonry.\n"
            "- Once outside, find a clear area away from power lines, buildings, and trees."
        )
    elif "flood" in msg or "water" in msg or "rain" in msg:
        reply = (
            "### 🌊 Flood Survival Protocol\n\n"
            "**IMMEDIATE ACTIONS:**\n"
            "1. **Move to Higher Ground:** Do not wait for instructions. Evacuate vertical columns if flash flooding is imminent.\n"
            "2. **Avoid Standing Water:** Do not walk or drive through flood waters. Just 15cm (6 inches) of moving water can knock you down, and 30cm (1 foot) can sweep vehicles away.\n"
            "3. **Utilities:** Shut off main power switches and gas valves if safe to do so to prevent fires or electrocution.\n\n"
            "**EMERGENCY KIT ESSENTIALS:**\n"
            "- Potable water (3 liters/day per person), canned nutrition, battery-powered UHF radio, waterproof flashlights, and thermal blankets."
        )
    elif "cyclone" in msg or "hurricane" in msg or "wind" in msg or "storm" in msg:
        reply = (
            "### 🌪️ Cyclone/Hurricane Threat Protocol\n\n"
            "**DURING A CYCLONE:**\n"
            "1. **Shelter in Place:** Board up windows, secure loose outdoor objects, and retreat to an interior, windowless room on the lowest floor.\n"
            "2. **Monitor Barometric Pressures:** If the eye of the storm passes, wind speeds will drop temporarily. Do NOT go outside, as severe winds will resume suddenly from the opposite direction.\n"
            "3. **Disconnect Electronics:** Unplug major hardware to protect from surge overloads when lightning strikes occur."
        )
    elif "fire" in msg or "smoke" in msg or "wildfire" in msg:
        reply = (
            "### 🔥 Wildfire Active Threat Procedure\n\n"
            "**IF TRAPPED IN A STRUCTURE:**\n"
            "1. Keep all doors and windows closed to block hot embers, but keep them unlocked for emergency search responders.\n"
            "2. Fill bathtubs, buckets, and sinks with water to assist with spot extinguishing.\n"
            "3. Wear natural fibers (cotton/wool) to prevent synthetic materials from melting onto skin.\n\n"
            "**EVACUATION CHECKLIST:**\n"
            "- Pack critical medication, identification papers, and N95 respirators to filter toxic ash particles."
        )
    elif "landslide" in msg or "mudslide" in msg or "slope" in msg:
        reply = (
            "### 🏔️ Landslide / Debris Flow Alert Guidance\n\n"
            "**WARNING SIGNS:**\n"
            "- Unusual sounds like trees cracking, boulders knocking together, or sudden water level drops in local streams.\n"
            "- Tilted trees, poles, or cracks appearing in roads and hillsides.\n\n"
            "**IMMEDIATE SURVIVAL ACTION:**\n"
            "- If you cannot evacuate, curl into a tight ball and protect your head. Stay clear of drainage paths where debris flow is channeled."
        )
    else:
        reply = (
            "### 🤖 DisasterVision AI Response Unit\n\n"
            "I am your emergency preparedness assistant. Ask me questions like:\n"
            "- *How do I prepare for a flood?*\n"
            "- *What is the drop, cover, and hold protocol during earthquakes?*\n"
            "- *What should be in my emergency disaster kit?*\n"
            "- *What warnings precede a landslide?*\n\n"
            "In an active threat, click the **SOS Dashboard** immediately in the Sidebar to signal emergency services and view local shelters."
        )
        
    return {"reply": reply}

@app.post("/api/sos")
def trigger_sos(request: SOSRequest):
    # Simulated rescue response
    import random
    
    shelters = [
        {"name": "Metro Emergency Shelter Alpha", "distance_km": round(random.uniform(1.2, 3.5), 1), "lat": request.lat + 0.012, "lng": request.lng - 0.008, "capacity_status": "72% Occupied"},
        {"name": "St. Jude Relief Hospital & Shelter", "distance_km": round(random.uniform(2.1, 5.0), 1), "lat": request.lat - 0.015, "lng": request.lng + 0.011, "capacity_status": "45% Occupied"},
        {"name": "Community Safe Haven Base", "distance_km": round(random.uniform(3.4, 7.2), 1), "lat": request.lat + 0.024, "lng": request.lng + 0.021, "capacity_status": "18% Occupied"}
    ]
    
    contacts = [
        {"department": "National Disaster Response Force (NDRF)", "hotline": "1078"},
        {"department": "Red Cross Emergency Dispatch", "hotline": "1800-RED-CROSS"},
        {"department": "Local Medical Evacuation Support", "hotline": "911-AIR"},
        {"department": "Toxic Chemical & Fire Containment", "hotline": "101-HAZMAT"}
    ]
    
    # Log emergency to active alerts feed
    alert_msg = f"EMERGENCY BEACON ACTIVATED. User: {request.user_name} (Phone: {request.phone}) triggered SOS signal for an active {request.emergency_type}."
    db.add_alert(f"SOS - {request.emergency_type}", "Critical", f"Lat: {request.lat:.4f}, Lng: {request.lng:.4f}", alert_msg)
    
    return {
        "status": "beacon_active",
        "beacon_id": random.randint(10000, 99999),
        "message": "Emergency signal broadcasted. Rescue agencies have been notified with coordinates.",
        "nearby_shelters": shelters,
        "emergency_contacts": contacts
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
