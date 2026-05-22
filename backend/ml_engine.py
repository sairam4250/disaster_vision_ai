import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import db

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Feature Definitions
FEATURES = {
    "flood": ["rainfall", "soil_moisture", "elevation", "temperature", "river_level"],
    "earthquake": ["tectonic_distance", "seismic_depth", "magnitude_trend", "historical_frequency", "magnetic_anomaly"],
    "cyclone": ["sea_temp", "pressure", "wind_speed", "humidity", "thermal_energy"],
    "wildfire": ["temperature", "humidity", "wind_speed", "drought_index", "vegetation_density"],
    "landslide": ["slope_angle", "soil_moisture", "rainfall_intensity", "vegetation_coverage", "seismic_activity"]
}

SEVERITIES = ["Low", "Moderate", "High", "Critical"]

def get_model_path(disaster_type):
    return os.path.join(MODELS_DIR, f"{disaster_type}.joblib")

def get_dataset_path(disaster_type):
    return os.path.join(DATA_DIR, f"{disaster_type}_historical.csv")

def generate_synthetic_dataset(disaster_type, n_samples=500):
    np.random.seed(42)
    path = get_dataset_path(disaster_type)
    
    if disaster_type == "flood":
        rainfall = np.random.uniform(0, 400, n_samples)
        soil_moisture = np.random.uniform(10, 100, n_samples)
        elevation = np.random.uniform(5, 1000, n_samples)
        temperature = np.random.uniform(10, 40, n_samples)
        river_level = np.random.uniform(0, 10, n_samples)
        
        # Risk score calculation
        score = (rainfall * 0.4) + (soil_moisture * 0.3) + (river_level * 0.3 * 10) - (elevation * 0.05)
        severity = np.where(score > 180, 3, np.where(score > 120, 2, np.where(score > 60, 1, 0)))
        
        df = pd.DataFrame({
            "rainfall": rainfall,
            "soil_moisture": soil_moisture,
            "elevation": elevation,
            "temperature": temperature,
            "river_level": river_level,
            "severity": severity
        })
        
    elif disaster_type == "earthquake":
        tectonic_distance = np.random.uniform(0, 500, n_samples)
        seismic_depth = np.random.uniform(2, 700, n_samples)
        magnitude_trend = np.random.uniform(1.0, 9.0, n_samples)
        historical_frequency = np.random.uniform(0, 50, n_samples)
        magnetic_anomaly = np.random.uniform(-100, 100, n_samples)
        
        score = (magnitude_trend * 30) - (tectonic_distance * 0.15) - (seismic_depth * 0.05) + (historical_frequency * 1.5)
        severity = np.where(score > 180, 3, np.where(score > 120, 2, np.where(score > 60, 1, 0)))
        
        df = pd.DataFrame({
            "tectonic_distance": tectonic_distance,
            "seismic_depth": seismic_depth,
            "magnitude_trend": magnitude_trend,
            "historical_frequency": historical_frequency,
            "magnetic_anomaly": magnetic_anomaly,
            "severity": severity
        })
        
    elif disaster_type == "cyclone":
        sea_temp = np.random.uniform(15, 35, n_samples)
        pressure = np.random.uniform(920, 1020, n_samples)
        wind_speed = np.random.uniform(10, 280, n_samples)
        humidity = np.random.uniform(30, 100, n_samples)
        thermal_energy = np.random.uniform(0, 120, n_samples)
        
        score = (wind_speed * 0.4) + ((1020 - pressure) * 0.8) + ((sea_temp - 20) * 2.0) + (humidity * 0.2)
        severity = np.where(score > 120, 3, np.where(score > 80, 2, np.where(score > 40, 1, 0)))
        
        df = pd.DataFrame({
            "sea_temp": sea_temp,
            "pressure": pressure,
            "wind_speed": wind_speed,
            "humidity": humidity,
            "thermal_energy": thermal_energy,
            "severity": severity
        })
        
    elif disaster_type == "wildfire":
        temperature = np.random.uniform(15, 48, n_samples)
        humidity = np.random.uniform(5, 80, n_samples)
        wind_speed = np.random.uniform(0, 80, n_samples)
        drought_index = np.random.uniform(0, 10, n_samples)
        vegetation_density = np.random.uniform(10, 100, n_samples)
        
        score = (temperature * 2.5) - (humidity * 1.5) + (wind_speed * 0.5) + (drought_index * 12) + (vegetation_density * 0.3)
        severity = np.where(score > 140, 3, np.where(score > 90, 2, np.where(score > 40, 1, 0)))
        
        df = pd.DataFrame({
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "drought_index": drought_index,
            "vegetation_density": vegetation_density,
            "severity": severity
        })
        
    elif disaster_type == "landslide":
        slope_angle = np.random.uniform(5, 75, n_samples)
        soil_moisture = np.random.uniform(10, 100, n_samples)
        rainfall_intensity = np.random.uniform(0, 120, n_samples)
        vegetation_coverage = np.random.uniform(5, 100, n_samples)
        seismic_activity = np.random.uniform(0, 10, n_samples)
        
        score = (slope_angle * 1.5) + (soil_moisture * 0.4) + (rainfall_intensity * 0.8) - (vegetation_coverage * 0.3) + (seismic_activity * 8)
        severity = np.where(score > 100, 3, np.where(score > 60, 2, np.where(score > 30, 1, 0)))
        
        df = pd.DataFrame({
            "slope_angle": slope_angle,
            "soil_moisture": soil_moisture,
            "rainfall_intensity": rainfall_intensity,
            "vegetation_coverage": vegetation_coverage,
            "seismic_activity": seismic_activity,
            "severity": severity
        })
        
    df.to_csv(path, index=False)
    return path

def train_model(disaster_type):
    csv_path = get_dataset_path(disaster_type)
    if not os.path.exists(csv_path):
        generate_synthetic_dataset(disaster_type)
        
    df = pd.read_csv(csv_path)
    feature_cols = FEATURES[disaster_type]
    X = df[feature_cols]
    y = df["severity"]
    
    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    
    model_path = get_model_path(disaster_type)
    joblib.dump(model, model_path)
    
    # Log training to database
    db.log_training(disaster_type, accuracy, model_path, feature_cols)
    
    return accuracy

def init_models():
    for dt in FEATURES.keys():
        model_path = get_model_path(dt)
        if not os.path.exists(model_path):
            print(f"Training initial model for {dt}...")
            train_model(dt)

def predict_disaster(disaster_type, inputs):
    model_path = get_model_path(disaster_type)
    if not os.path.exists(model_path):
        train_model(disaster_type)
        
    model = joblib.load(model_path)
    
    # Convert input dict to feature list
    feature_cols = FEATURES[disaster_type]
    input_vector = [inputs.get(col, 0) for col in feature_cols]
    
    # Get prediction and probabilities
    pred_class = int(model.predict([input_vector])[0])
    probs = model.predict_proba([input_vector])[0]
    
    # Calculate confidence as the probability of the predicted class
    confidence = float(probs[pred_class])
    
    # Risk percentage based on probability weighted sum
    # Low=0, Mod=1, High=2, Crit=3
    risk_percentage = float(np.sum(probs * np.array([10, 40, 75, 100])))
    
    severity_label = SEVERITIES[pred_class]
    
    # Log prediction to DB
    db.log_prediction(disaster_type, inputs, confidence, risk_percentage, severity_label)
    
    return {
        "severity": severity_label,
        "confidence": confidence,
        "risk_percentage": risk_percentage,
        "probabilities": {SEVERITIES[i]: float(probs[i]) for i in range(len(probs))}
    }
