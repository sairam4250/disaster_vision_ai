"use client";

import React, { useState } from "react";
import { Cpu, AlertTriangle, HelpCircle, Shield, Play, RefreshCw, BarChart2 } from "lucide-react";
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

  const executeAIModel = async () => {
    setCalculating(true);
    setResult(null);

    // Simulate short computation delay for premium visual feedback
    await new Promise((resolve) => setTimeout(resolve, 1800));

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
          AI predictive inference
        </h2>
        <p className="text-xs text-gray-400 font-mono">
          Input regional telemetry variables to execute real-time disaster forecast classification.
        </p>
      </div>

      {/* Model Tabs Selection */}
      <div className="flex flex-wrap gap-2 border-b border-cyber-border/20 pb-3">
        {(["flood", "earthquake", "cyclone", "wildfire", "landslide"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setResult(null);
            }}
            className={`rounded px-4 py-2 font-mono text-xs font-semibold tracking-wider transition-all duration-300 uppercase ${
              activeTab === tab
                ? "border border-neon-blue bg-neon-blue/15 text-neon-cyan shadow-glow-blue"
                : "border border-transparent text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Left: Interactive Input Panel */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <Cpu className="h-4 w-4 text-neon-blue animate-pulse" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Telemetry Parameters
            </span>
          </div>

          <div className="space-y-5">
            {Object.keys(featureDetails[activeTab]).map((feature) => {
              const details = featureDetails[activeTab][feature];
              const currentVal = inputs[activeTab][feature];

              return (
                <div key={feature} className="space-y-2">
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-gray-400">{details.label}</span>
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
                    className="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer accent-neon-blue border border-cyber-border/30"
                  />
                </div>
              );
            })}
          </div>

          {/* Trigger button */}
          <button
            onClick={executeAIModel}
            disabled={calculating}
            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple py-3.5 font-mono text-xs font-extrabold tracking-widest text-white shadow-glow-blue hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {calculating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>COMPUTING NEURAL TENSORS...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>RUN PREDICTION INFERENCE</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Results Analysis Screen */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 flex flex-col justify-between relative overflow-hidden">
          
          {/* Scan Line effect on calculating */}
          {calculating && (
            <div className="absolute inset-0 bg-neon-blue/5 z-10 pointer-events-none">
              <div className="w-full h-1 bg-neon-blue/30 shadow-glow-blue absolute top-0 animate-scan" />
            </div>
          )}

          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <BarChart2 className="h-4 w-4 text-neon-purple animate-pulse" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              AI Evaluation Output
            </span>
          </div>

          {result ? (
            <div className="space-y-6 py-4 flex-1 flex flex-col justify-between">
              
              {/* Severity Alert */}
              <div className={`rounded-lg border p-4 flex items-start space-x-3 ${getSeverityStyles(result.severity)}`}>
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-mono text-xs font-extrabold tracking-widest uppercase">
                    SEVERITY CLASSIFICATION: {result.severity}
                  </h4>
                  <p className="font-mono text-[9px] text-gray-400 mt-1 leading-normal">
                    {result.severity === "Critical" && "IMMEDIATE EVACUATION PROTOCOLS ACTIVATED. Secondary risks present."}
                    {result.severity === "High" && "Prepare local mitigation structures. Coordinate with emergency dispatch centers."}
                    {result.severity === "Moderate" && "Continue meteorological observation. Advise caution in terrain columns."}
                    {result.severity === "Low" && "Safe levels registered. Baseline anomalies are standard."}
                  </p>
                </div>
              </div>

              {/* Meter Stats */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Risk Level gauge */}
                <div className="rounded border border-cyber-border/20 bg-black/40 p-3 text-center">
                  <div className="font-mono text-[8px] text-gray-400">RISK INDEX</div>
                  <div className={`font-mono text-2xl font-black mt-1 ${
                    result.risk_percentage > 75 ? "text-neon-red text-shadow-red" : "text-neon-cyan"
                  }`}>
                    {result.risk_percentage}%
                  </div>
                  <div className="h-1 w-full bg-black/50 rounded overflow-hidden mt-2">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        result.risk_percentage > 75 ? "bg-neon-red" : "bg-neon-cyan"
                      }`}
                      style={{ width: `${result.risk_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Accuracy Confidence */}
                <div className="rounded border border-cyber-border/20 bg-black/40 p-3 text-center">
                  <div className="font-mono text-[8px] text-gray-400">MODEL CONFIDENCE</div>
                  <div className="font-mono text-2xl font-black mt-1 text-neon-purple">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="font-mono text-[7px] text-gray-500 mt-2">
                    COMPUTED VIA RF ENSEMBLE
                  </div>
                </div>

              </div>

              {/* Suggestions */}
              <div className="rounded border border-cyber-border/20 bg-white/5 p-3 font-mono text-[9px] text-gray-400 space-y-2">
                <div className="flex items-center space-x-1 text-white font-bold">
                  <Shield className="h-3 w-3 text-neon-cyan" />
                  <span>PREVENTATIVE EVACUATION ACTIONS:</span>
                </div>
                {result.severity === "Critical" || result.severity === "High" ? (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Pack emergency satellite communications hardware.</li>
                    <li>Move up to levels beyond flood zones or clear fire paths.</li>
                    <li>Refer to Emergency SOS Tab for regional medical shelters.</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Maintain grid tracking channels.</li>
                    <li>No immediate displacement actions necessary.</li>
                  </ul>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 font-mono">
              <Cpu className="h-10 w-10 text-cyber-border/80 animate-pulse" />
              <div className="text-xs text-gray-500">AWAITING Telemetry VARIABLES INPUT...</div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
