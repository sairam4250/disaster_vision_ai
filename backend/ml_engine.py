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

def generate_synthetic_dataset(disaster_type, n_samples=2500):
    np.random.seed(42)
    path = get_dataset_path(disaster_type)
    
    if disaster_type == "flood":
        # Indian monsoonal flood ranges
        rainfall = np.random.uniform(0, 600, n_samples)
        soil_moisture = np.random.uniform(10, 100, n_samples)
        elevation = np.random.uniform(2, 3000, n_samples)
        temperature = np.random.uniform(10, 45, n_samples)
        river_level = np.random.uniform(0, 15, n_samples)
        
        # Risk classification based on axis-aligned warning thresholds
        severity = np.where((rainfall > 350) & (river_level > 9), 3,
                   np.where((rainfall > 200) & (river_level > 5), 2,
                   np.where((rainfall > 80) | (river_level > 2), 1, 0)))
        
        df = pd.DataFrame({
            "rainfall": rainfall,
            "soil_moisture": soil_moisture,
            "elevation": elevation,
            "temperature": temperature,
            "river_level": river_level,
            "severity": severity
        })
        
    elif disaster_type == "earthquake":
        # Indian seismic fault zone characteristics (Himalayas crustal thrust, Kachchh rift)
        tectonic_distance = np.random.uniform(0, 500, n_samples)
        seismic_depth = np.random.uniform(5, 150, n_samples)
        magnitude_trend = np.random.uniform(1.0, 8.5, n_samples)
        historical_frequency = np.random.uniform(0, 60, n_samples)
        magnetic_anomaly = np.random.uniform(-100, 100, n_samples)
        
        # Risk classification thresholds
        severity = np.where((magnitude_trend > 6.5) & (tectonic_distance < 100) & (seismic_depth < 50), 3,
                   np.where((magnitude_trend > 5.0) & (tectonic_distance < 200), 2,
                   np.where((magnitude_trend > 3.5) | (historical_frequency > 30), 1, 0)))
        
        df = pd.DataFrame({
            "tectonic_distance": tectonic_distance,
            "seismic_depth": seismic_depth,
            "magnitude_trend": magnitude_trend,
            "historical_frequency": historical_frequency,
            "magnetic_anomaly": magnetic_anomaly,
            "severity": severity
        })
        
    elif disaster_type == "cyclone":
        # Bay of Bengal / Arabian Sea cyclogenesis properties
        sea_temp = np.random.uniform(24, 34, n_samples)
        pressure = np.random.uniform(900, 1020, n_samples)
        wind_speed = np.random.uniform(10, 300, n_samples)
        humidity = np.random.uniform(40, 100, n_samples)
        thermal_energy = np.random.uniform(0, 150, n_samples)
        
        # Risk classification thresholds
        severity = np.where((wind_speed > 180) & (sea_temp > 28) & (pressure < 950), 3,
                   np.where((wind_speed > 100) & (pressure < 980), 2,
                   np.where((wind_speed > 50) | (sea_temp > 26.5), 1, 0)))
        
        df = pd.DataFrame({
            "sea_temp": sea_temp,
            "pressure": pressure,
            "wind_speed": wind_speed,
            "humidity": humidity,
            "thermal_energy": thermal_energy,
            "severity": severity
        })
        
    elif disaster_type == "wildfire":
        # Summer dry forest / grass land fires in Central India & Western Ghats
        temperature = np.random.uniform(20, 50, n_samples)
        humidity = np.random.uniform(5, 70, n_samples)
        wind_speed = np.random.uniform(0, 90, n_samples)
        drought_index = np.random.uniform(0, 10, n_samples)
        vegetation_density = np.random.uniform(10, 100, n_samples)
        
        # Risk classification thresholds
        severity = np.where((temperature > 42) & (humidity < 15) & (drought_index > 7.5), 3,
                   np.where((temperature > 35) & (humidity < 25), 2,
                   np.where((temperature > 30) | (drought_index > 5.0), 1, 0)))
        
        df = pd.DataFrame({
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "drought_index": drought_index,
            "vegetation_density": vegetation_density,
            "severity": severity
        })
        
    elif disaster_type == "landslide":
        # Steep terrains in Himalayas & Western Ghats triggered by monsoon rain
        slope_angle = np.random.uniform(10, 75, n_samples)
        soil_moisture = np.random.uniform(10, 100, n_samples)
        rainfall_intensity = np.random.uniform(0, 150, n_samples)
        vegetation_coverage = np.random.uniform(5, 100, n_samples)
        seismic_activity = np.random.uniform(0, 8, n_samples)
        
        # Risk classification thresholds
        severity = np.where((slope_angle > 45) & (soil_moisture > 80) & (rainfall_intensity > 80), 3,
                   np.where((slope_angle > 30) & (rainfall_intensity > 40), 2,
                   np.where((slope_angle > 20) | (soil_moisture > 60), 1, 0)))
        
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
    
    model = RandomForestClassifier(n_estimators=200, max_depth=12, min_samples_split=4, random_state=42)
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
    
    # Get prediction and probabilities using DataFrame to avoid feature names warning
    input_df = pd.DataFrame([input_vector], columns=feature_cols)
    pred_class = int(model.predict(input_df)[0])
    probs = model.predict_proba(input_df)[0]
    
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
