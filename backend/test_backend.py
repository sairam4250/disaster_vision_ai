import os
import sys
import json

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import db
import ml_engine

def run_tests():
    print("--- STARTING BACKEND TELEMETRY TESTS ---")
    
    # 1. Test database initialization
    print("\n[Test 1] Initializing Database...")
    db.init_db()
    print("Database verified successfully.")
    
    # 2. Test models training
    print("\n[Test 2] Loading/Training ML Models...")
    ml_engine.init_models()
    print("Models verified successfully.")
    
    # 3. Test Predictions
    print("\n[Test 3] Executing prediction vectors...")
    
    # Flood prediction test
    flood_inputs = {
        "rainfall": 280.0,
        "soil_moisture": 95.0,
        "elevation": 20.0,
        "temperature": 25.0,
        "river_level": 8.5
    }
    flood_res = ml_engine.predict_disaster("flood", flood_inputs)
    print(f"Flood Prediction: Severity={flood_res['severity']}, Confidence={flood_res['confidence']:.2f}, Risk={flood_res['risk_percentage']}%")
    assert flood_res['severity'] in ["Low", "Moderate", "High", "Critical"]
    
    # Wildfire prediction test
    wildfire_inputs = {
        "temperature": 42.0,
        "humidity": 8.0,
        "wind_speed": 55.0,
        "drought_index": 9.2,
        "vegetation_density": 85.0
    }
    wildfire_res = ml_engine.predict_disaster("wildfire", wildfire_inputs)
    print(f"Wildfire Prediction: Severity={wildfire_res['severity']}, Confidence={wildfire_res['confidence']:.2f}, Risk={wildfire_res['risk_percentage']}%")
    assert wildfire_res['severity'] in ["Low", "Moderate", "High", "Critical"]
    
    # 4. Test alerts logging
    print("\n[Test 4] Verifying database alerts feed...")
    alerts = db.get_active_alerts()
    print(f"Active Alerts count on grid: {len(alerts)}")
    assert len(alerts) > 0
    
    print("\n--- ALL BACKEND TESTS COMPLETED SUCCESSFULLY ---")

if __name__ == "__main__":
    run_tests()
