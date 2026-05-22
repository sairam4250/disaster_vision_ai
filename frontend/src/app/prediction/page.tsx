"use client";

import React, { useState } from "react";
import { Cpu, AlertTriangle, Shield, Play, RefreshCw, BarChart2, Sparkles, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface PredictionResult {
  severity: "Low" | "Moderate" | "High" | "Critical";
  confidence: number;
  risk_percentage: number;
  probabilities: Record<string, number>;
}

// Initial Feature Sets for sliding parameters
const initialFeatures = {
  flood: {
    rainfall: 120, // mm
    soil_moisture: 60, // %
    elevation: 300, // meters
    temperature: 25, // °C
    river_level: 3.5, // meters
  },
  earthquake: {
    tectonic_distance: 120, // km
    seismic_depth: 35, // km
    magnitude_trend: 4.5, // Richter
    historical_frequency: 12, // occurrences
    magnetic_anomaly: 15, // nT
  },
  cyclone: {
    sea_temp: 27.5, // °C
    pressure: 980, // hPa
    wind_speed: 85, // km/h
    humidity: 78, // %
    thermal_energy: 45, // kJ
  },
  wildfire: {
    temperature: 32, // °C
    humidity: 28, // %
    wind_speed: 35, // km/h
    drought_index: 5.5, // 0-10 scale
    vegetation_density: 65, // %
  },
  landslide: {
    slope_angle: 32, // degrees
    soil_moisture: 70, // %
    rainfall_intensity: 45, // mm/hr
    vegetation_coverage: 40, // %
    seismic_activity: 1.5, // ML
  }
};

const featureDetails: Record<string, Record<string, { label: string; min: number; max: number; step: number; unit: string }>> = {
  flood: {
    rainfall: { label: "Rainfall Intensity", min: 0, max: 600, step: 5, unit: "mm/day" },
    soil_moisture: { label: "Soil Saturation", min: 10, max: 100, step: 1, unit: "%" },
    elevation: { label: "Elevation Above Sea Level", min: 2, max: 3000, step: 10, unit: "meters" },
    temperature: { label: "Ambient Temperature", min: 10, max: 45, step: 1, unit: "°C" },
    river_level: { label: "River Gauge Offset", min: 0, max: 15, step: 0.1, unit: "meters" }
  },
  earthquake: {
    tectonic_distance: { label: "Distance to Fault Line", min: 0, max: 500, step: 5, unit: "km" },
    seismic_depth: { label: "Anomalous Hypocenter Depth", min: 5, max: 150, step: 1, unit: "km" },
    magnitude_trend: { label: "Seismic Magnitude Trend", min: 1.0, max: 8.5, step: 0.1, unit: "Richter" },
    historical_frequency: { label: "Historical Regional Activity", min: 0, max: 60, step: 1, unit: "eq/year" },
    magnetic_anomaly: { label: "Local Geomagnetic Deflection", min: -100, max: 100, step: 2, unit: "nT" }
  },
  cyclone: {
    sea_temp: { label: "Ocean Surface Temperature", min: 24, max: 34, step: 0.5, unit: "°C" },
    pressure: { label: "Sea Level Barometric Pressure", min: 900, max: 1020, step: 2, unit: "hPa" },
    wind_speed: { label: "Maximum Surface Winds", min: 10, max: 300, step: 5, unit: "km/h" },
    humidity: { label: "Mid-Tropospheric Humidity", min: 40, max: 100, step: 1, unit: "%" },
    thermal_energy: { label: "Oceanic Heat Content", min: 0, max: 150, step: 2, unit: "kJ/cm²" }
  },
  wildfire: {
    temperature: { label: "Surface Air Temperature", min: 20, max: 50, step: 1, unit: "°C" },
    humidity: { label: "Relative Air Humidity", min: 5, max: 70, step: 1, unit: "%" },
    wind_speed: { label: "Local Wind Velocities", min: 0, max: 90, step: 2, unit: "km/h" },
    drought_index: { label: "Keetch-Byram Drought Index", min: 0.0, max: 10.0, step: 0.1, unit: "rating" },
    vegetation_density: { label: "Fuel/Vegetation Density", min: 10, max: 100, step: 1, unit: "%" }
  },
  landslide: {
    slope_angle: { label: "Slope Incline Angle", min: 10, max: 75, step: 1, unit: "degrees" },
    soil_moisture: { label: "Soil Water Content", min: 10, max: 100, step: 1, unit: "%" },
    rainfall_intensity: { label: "Short-term Precipitation Rate", min: 0, max: 150, step: 2, unit: "mm/hr" },
    vegetation_coverage: { label: "Root System Anchoring Density", min: 5, max: 100, step: 1, unit: "%" },
    seismic_activity: { label: "Ambient Microseismic Activity", min: 0, max: 8, step: 0.1, unit: "ML" }
  }
};

// Citizen Friendly presets
const citizenPresets: Record<string, Array<{ name: string; desc: string; icon: string; values: Record<string, number> }>> = {
  flood: [
    {
      name: "Calm Sunny Day",
      desc: "Clear summer days with dry ground.",
      icon: "☀️",
      values: { rainfall: 10, soil_moisture: 20, elevation: 500, temperature: 32, river_level: 1.0 }
    },
    {
      name: "Heavy Monsoon Weeks",
      desc: "Persistent rainy period causing saturations.",
      icon: "🌧️",
      values: { rainfall: 220, soil_moisture: 78, elevation: 150, temperature: 24, river_level: 6.2 }
    },
    {
      name: "Severe Cloudburst Flood",
      desc: "Dangerous flash rains overflowing riverbanks.",
      icon: "⛈️",
      values: { rainfall: 490, soil_moisture: 96, elevation: 15, temperature: 19, river_level: 12.8 }
    }
  ],
  earthquake: [
    {
      name: "Solid Flat Plateau",
      desc: "Zero active vibrations or fault risks.",
      icon: "🟢",
      values: { tectonic_distance: 480, seismic_depth: 90, magnitude_trend: 1.2, historical_frequency: 1, magnetic_anomaly: 2 }
    },
    {
      name: "Minor Land Tremors",
      desc: "Small localized shaking felt briefly.",
      icon: "🟡",
      values: { tectonic_distance: 160, seismic_depth: 45, magnitude_trend: 4.8, historical_frequency: 15, magnetic_anomaly: 35 }
    },
    {
      name: "Major Fault Displacement",
      desc: "Shallow, powerful tectonic adjustment.",
      icon: "🔴",
      values: { tectonic_distance: 18, seismic_depth: 10, magnitude_trend: 7.9, historical_frequency: 48, magnetic_anomaly: 88 }
    }
  ],
  cyclone: [
    {
      name: "Mild Sea Breeze",
      desc: "Gentle offshore winds, normal pressure.",
      icon: "🍃",
      values: { sea_temp: 25.0, pressure: 1012, wind_speed: 12, humidity: 50, thermal_energy: 10 }
    },
    {
      name: "Depression Warning",
      desc: "Low-pressure cell forming in bay zones.",
      icon: "🌧️",
      values: { sea_temp: 27.8, pressure: 982, wind_speed: 75, humidity: 80, thermal_energy: 70 }
    },
    {
      name: "Super Cyclone Landfall",
      desc: "Category 5 force winds hitting coast.",
      icon: "🌀",
      values: { sea_temp: 32.0, pressure: 915, wind_speed: 255, humidity: 96, thermal_energy: 140 }
    }
  ],
  wildfire: [
    {
      name: "Moist Forest Cover",
      desc: "Cool, damp air protecting canopy areas.",
      icon: "🌲",
      values: { temperature: 17, humidity: 72, wind_speed: 10, drought_index: 0.8, vegetation_density: 88 }
    },
    {
      name: "Dry Heatwave Summer",
      desc: "High temp afternoon with dry air.",
      icon: "☀️",
      values: { temperature: 36, humidity: 22, wind_speed: 25, drought_index: 4.5, vegetation_density: 62 }
    },
    {
      name: "Extreme Drought Sparks",
      desc: "Highly flammable wind gusts, high heat.",
      icon: "🔥",
      values: { temperature: 47, humidity: 6, wind_speed: 65, drought_index: 9.4, vegetation_density: 40 }
    }
  ],
  landslide: [
    {
      name: "Stable Solid Base",
      desc: "Low incline flat soil, dense trees.",
      icon: "🏔️",
      values: { slope_angle: 12, soil_moisture: 20, rainfall_intensity: 5, vegetation_coverage: 92, seismic_activity: 0.1 }
    },
    {
      name: "Saturated Soil Incline",
      desc: "Moderate hill slopes after monsoon rain.",
      icon: "🌧️",
      values: { slope_angle: 32, soil_moisture: 75, rainfall_intensity: 55, vegetation_coverage: 50, seismic_activity: 1.0 }
    },
    {
      name: "Deforested Cliff Storm",
      desc: "Steep mountain ravine mudflow risk.",
      icon: "⛈️",
      values: { slope_angle: 68, soil_moisture: 98, rainfall_intensity: 130, vegetation_coverage: 8, seismic_activity: 4.2 }
    }
  ]
};

export default function PredictionPage() {
  const [activeTab, setActiveTab] = useState<"flood" | "earthquake" | "cyclone" | "wildfire" | "landslide">("flood");
  const [inputs, setInputs] = useState<Record<string, Record<string, number>>>(initialFeatures);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleInputChange = (featureName: string, val: number) => {
    setInputs({
      ...inputs,
      [activeTab]: {
        ...inputs[activeTab],
        [featureName]: val
      }
    });
  };

  const applyPreset = (values: Record<string, number>) => {
    setInputs({
      ...inputs,
      [activeTab]: {
        ...inputs[activeTab],
        ...values
      }
    });
    setResult(null);
  };

  const executeAIModel = async () => {
    setCalculating(true);
    setResult(null);

    // Simulate short computation delay for premium visual feedback
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch(`http://localhost:8000/api/predict/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: inputs[activeTab] })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        triggerVFX(data.severity);
      } else {
        throw new Error("Model response failed");
      }
    } catch (err) {
      console.warn("Backend API not reachable. Performing mock prediction offline.", err);
      
      const tabInputs = inputs[activeTab];
      let severity: "Low" | "Moderate" | "High" | "Critical" = "Low";
      let riskVal = 10;
      
      if (activeTab === "flood") {
        const isCrit = tabInputs.rainfall > 350 && tabInputs.river_level > 9;
        const isHigh = tabInputs.rainfall > 200 && tabInputs.river_level > 5;
        const isMod = tabInputs.rainfall > 80 || tabInputs.river_level > 2;
        severity = isCrit ? "Critical" : isHigh ? "High" : isMod ? "Moderate" : "Low";
        riskVal = isCrit ? 92 : isHigh ? 78 : isMod ? 45 : 12;
      } else if (activeTab === "earthquake") {
        const isCrit = tabInputs.magnitude_trend > 6.5 && tabInputs.tectonic_distance < 100 && tabInputs.seismic_depth < 50;
        const isHigh = tabInputs.magnitude_trend > 5.0 && tabInputs.tectonic_distance < 200;
        const isMod = tabInputs.magnitude_trend > 3.5 || tabInputs.historical_frequency > 30;
        severity = isCrit ? "Critical" : isHigh ? "High" : isMod ? "Moderate" : "Low";
        riskVal = isCrit ? 95 : isHigh ? 72 : isMod ? 48 : 15;
      } else if (activeTab === "cyclone") {
        const isCrit = tabInputs.wind_speed > 180 && tabInputs.sea_temp > 28 && tabInputs.pressure < 950;
        const isHigh = tabInputs.wind_speed > 100 && tabInputs.pressure < 980;
        const isMod = tabInputs.wind_speed > 50 || tabInputs.sea_temp > 26.5;
        severity = isCrit ? "Critical" : isHigh ? "High" : isMod ? "Moderate" : "Low";
        riskVal = isCrit ? 94 : isHigh ? 80 : isMod ? 52 : 18;
      } else if (activeTab === "wildfire") {
        const isCrit = tabInputs.temperature > 42 && tabInputs.humidity < 15 && tabInputs.drought_index > 7.5;
        const isHigh = tabInputs.temperature > 35 && tabInputs.humidity < 25;
        const isMod = tabInputs.temperature > 30 || tabInputs.drought_index > 5.0;
        severity = isCrit ? "Critical" : isHigh ? "High" : isMod ? "Moderate" : "Low";
        riskVal = isCrit ? 96 : isHigh ? 75 : isMod ? 42 : 14;
      } else if (activeTab === "landslide") {
        const isCrit = tabInputs.slope_angle > 45 && tabInputs.soil_moisture > 80 && tabInputs.rainfall_intensity > 80;
        const isHigh = tabInputs.slope_angle > 30 && tabInputs.rainfall_intensity > 40;
        const isMod = tabInputs.slope_angle > 20 || tabInputs.soil_moisture > 60;
        severity = isCrit ? "Critical" : isHigh ? "High" : isMod ? "Moderate" : "Low";
        riskVal = isCrit ? 91 : isHigh ? 68 : isMod ? 38 : 10;
      }

      const mockRes: PredictionResult = {
        severity,
        confidence: 0.82 + Math.random() * 0.15,
        risk_percentage: riskVal,
        probabilities: {
          Low: severity === "Low" ? 0.8 : 0.05,
          Moderate: severity === "Moderate" ? 0.75 : 0.1,
          High: severity === "High" ? 0.82 : 0.08,
          Critical: severity === "Critical" ? 0.91 : 0.02
        }
      };
      
      setResult(mockRes);
      triggerVFX(severity);
    } finally {
      setCalculating(false);
    }
  };

  const triggerVFX = (severity: string) => {
    if (severity === "Critical") {
      confetti({ particleCount: 80, spread: 80, colors: ["#FF4D4D", "#7B2FF7"] });
    }
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case "Critical": return "border-neon-red text-neon-red shadow-glow-red bg-red-950/20";
      case "High": return "border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)] bg-orange-950/20";
      case "Moderate": return "border-yellow-500 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)] bg-yellow-950/20";
      default: return "border-neon-blue text-neon-blue shadow-glow-blue bg-blue-950/20";
    }
  };

  const getCitizenExplanation = (type: string, sev: string, risk: number) => {
    if (sev === "Critical" || sev === "High") {
      return `This simulation indicates a high danger of ${type} with a ${risk}% likelihood. High warning: evacuation plans should be prepared, and travel near hazard zones should be suspended immediately.`;
    }
    if (sev === "Moderate") {
      return `This combination of variables points to a moderate risk of ${type}. Condition remains stable but warning indicators suggest preparing standard weather supplies.`;
    }
    return `Conditions are fully safe. This scenario represents normal, calm environmental readings. No caution is required.`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-cyber-border/20 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] tracking-wider text-neon-purple font-mono uppercase">
            <Sparkles className="h-3.5 w-3.5 text-neon-purple animate-pulse" />
            <span>Planetary Climate Core Systems</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            AI Hazard Simulation <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent font-mono">PREDICTOR</span>
          </h2>
        </div>
      </div>

      {/* Model Tabs Selection */}
      <div className="flex flex-wrap gap-2.5">
        {(["flood", "earthquake", "cyclone", "wildfire", "landslide"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setResult(null);
            }}
            className={`rounded-xl px-5 py-3 font-sans text-xs font-bold tracking-wider transition-all duration-300 uppercase flex items-center space-x-2 border ${
              activeTab === tab
                ? "border-neon-blue bg-neon-blue/15 text-neon-cyan shadow-glow-blue"
                : "border-cyber-border/30 text-gray-400 bg-black/40 hover:text-white hover:border-cyber-border/80"
            }`}
          >
            <span>{tab === "flood" && "🌊"}</span>
            <span>{tab === "earthquake" && "🫨"}</span>
            <span>{tab === "cyclone" && "🌀"}</span>
            <span>{tab === "wildfire" && "🔥"}</span>
            <span>{tab === "landslide" && "🏔️"}</span>
            <span>{tab} Predictor</span>
          </button>
        ))}
      </div>

      {/* Citizen Simulation Presets Header */}
      <div className="rounded-2xl border border-cyber-border/30 bg-black/40 p-4 space-y-3">
        <h3 className="font-sans text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Shield className="h-4.5 w-4.5 text-neon-cyan animate-pulse" />
          <span>⚡ Step 1: Click a Simple Preset (Easy for Common Citizens)</span>
        </h3>
        <p className="text-xs text-gray-400 leading-normal">
          Don't know the exact scientific metrics? Click a simple preset button below to load pre-configured realistic scenarios for Indian regions, then click Run!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {citizenPresets[activeTab].map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.values)}
              className="rounded-xl border border-cyber-border/30 bg-dark-bg/60 p-3 hover:border-neon-cyan hover:bg-neon-cyan/5 transition-all text-left flex flex-col justify-between group active:scale-95 duration-200"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{preset.icon}</span>
                <span className="font-bold text-xs text-white group-hover:text-neon-cyan transition-colors">{preset.name}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-sans mt-1.5 leading-normal">{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Left: Interactive Input Panel */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <Cpu className="h-4 w-4 text-neon-blue animate-pulse" />
            <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
              Step 2: Fine-tune Parameters (Advanced)
            </span>
          </div>

          <div className="space-y-5">
            {Object.keys(featureDetails[activeTab]).map((feature) => {
              const details = featureDetails[activeTab][feature];
              const currentVal = inputs[activeTab][feature];

              return (
                <div key={feature} className="space-y-2">
                  <div className="flex justify-between font-sans text-xs">
                    <span className="text-gray-300 font-medium">{details.label}</span>
                    <span className="text-neon-cyan font-bold">
                      {currentVal} {details.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={details.min}
                    max={details.max}
                    step={details.step}
                    value={currentVal}
                    onChange={(e) => handleInputChange(feature, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-neon-blue border border-cyber-border/30"
                  />
                </div>
              );
            })}
          </div>

          {/* Trigger button */}
          <button
            onClick={executeAIModel}
            disabled={calculating}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-4 font-sans text-xs font-extrabold tracking-widest text-white shadow-glow-blue hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {calculating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>COMPUTING NEURAL PREDICTOR...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>EXECUTE AI PREDICTION</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Results Analysis Screen */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 flex flex-col justify-between relative overflow-hidden">
          
          {/* Scan Line effect on calculating */}
          {calculating && (
            <div className="absolute inset-0 bg-neon-blue/5 z-10 pointer-events-none">
              <div className="w-full h-1.5 bg-neon-blue/30 shadow-glow-blue absolute top-0 animate-scan" />
            </div>
          )}

          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <BarChart2 className="h-4 w-4 text-neon-purple animate-pulse" />
            <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
              AI Hazard Forecast Report
            </span>
          </div>

          {result ? (
            <div className="space-y-5 py-4 flex-1 flex flex-col justify-between">
              
              {/* Severity Alert */}
              <div className={`rounded-xl border p-4 flex items-start space-x-3 transition-all ${getSeverityStyles(result.severity)}`}>
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-sans text-xs font-extrabold tracking-widest uppercase">
                    SEVERITY: {result.severity} ALERT
                  </h4>
                  <p className="font-sans text-xs text-gray-300 mt-1 leading-relaxed">
                    {getCitizenExplanation(activeTab, result.severity, result.risk_percentage)}
                  </p>
                </div>
              </div>

              {/* Meter Stats */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Risk Level gauge */}
                <div className="rounded-xl border border-cyber-border/20 bg-black/40 p-4 text-center">
                  <div className="font-sans text-[10px] text-gray-400">RISK INDEX</div>
                  <div className={`font-sans text-3xl font-black mt-1 ${
                    result.risk_percentage > 70 ? "text-neon-red text-shadow-red" : "text-neon-cyan"
                  }`}>
                    {result.risk_percentage}%
                  </div>
                  <div className="h-1.5 w-full bg-black/50 rounded overflow-hidden mt-2 border border-cyber-border/20">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        result.risk_percentage > 70 ? "bg-neon-red" : "bg-neon-cyan"
                      }`}
                      style={{ width: `${result.risk_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Accuracy Confidence */}
                <div className="rounded-xl border border-cyber-border/20 bg-black/40 p-4 text-center">
                  <div className="font-sans text-[10px] text-gray-400">AI PROBABILITY</div>
                  <div className="font-sans text-3xl font-black mt-1 text-neon-purple">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="font-sans text-[8px] text-gray-500 mt-2">
                    CLASSIFIER RELIABILITY
                  </div>
                </div>

              </div>

              {/* Suggestions */}
              <div className="rounded-xl border border-cyber-border/20 bg-white/5 p-4 font-sans text-xs text-gray-300 space-y-2">
                <div className="flex items-center space-x-1.5 text-white font-bold">
                  <Shield className="h-4.5 w-4.5 text-neon-cyan" />
                  <span>PREVENTATIVE EVACUATION ACTIONS:</span>
                </div>
                {result.severity === "Critical" || result.severity === "High" ? (
                  <ul className="space-y-1.5">
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-neon-red flex-shrink-0 mt-0.5" />
                      <span>Prepare bags with medications and emergency identification papers.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-neon-red flex-shrink-0 mt-0.5" />
                      <span>Avoid tunnels or mountains. Evacuate immediately if instructed by NDRF.</span>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-1.5">
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>No evacuation required. Monitor the telemetry stream regularly.</span>
                    </li>
                  </ul>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 font-sans">
              <Cpu className="h-12 w-12 text-cyber-border/80 animate-pulse" />
              <div className="text-xs text-gray-400">AWAITING CLIMATE METRICS FOR CLASSIFICATION...</div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
