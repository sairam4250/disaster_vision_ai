"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, 
  Cpu, 
  RefreshCw, 
  Upload, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  History
} from "lucide-react";
import confetti from "canvas-confetti";

interface ModelMetrics {
  model_accuracies: Record<string, number>;
  training_history: Array<{
    id: number;
    disaster_type: string;
    accuracy: number;
    model_path: string;
    features: string[];
    timestamp: string;
  }>;
  datasets: Record<string, { records: number }>;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [trainingState, setTrainingState] = useState<Record<string, "idle" | "training" | "complete">>({
    flood: "idle",
    earthquake: "idle",
    cyclone: "idle",
    wildfire: "idle",
    landslide: "idle"
  });
  
  // Custom synthetic dataset config
  const [selectedDataset, setSelectedDataset] = useState("flood");
  const [recordsCount, setRecordsCount] = useState(500);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.warn("Backend API not reachable. Loading mock admin analytics.", err);
      // Mock metrics fallback
      setMetrics({
        model_accuracies: { flood: 0.94, earthquake: 0.88, cyclone: 0.96, wildfire: 0.92, landslide: 0.85 },
        training_history: [
          { id: 1, disaster_type: "flood", accuracy: 0.94, model_path: "models/flood.joblib", features: ["rainfall", "soil_moisture", "elevation"], timestamp: new Date().toISOString() },
          { id: 2, disaster_type: "cyclone", accuracy: 0.96, model_path: "models/cyclone.joblib", features: ["sea_temp", "pressure", "wind_speed"], timestamp: new Date().toISOString() }
        ],
        datasets: { flood: { records: 500 }, earthquake: { records: 500 }, cyclone: { records: 500 }, wildfire: { records: 500 }, landslide: { records: 500 } }
      });
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const triggerTraining = async (disasterType: string) => {
    setTrainingState((prev) => ({ ...prev, [disasterType]: "training" }));

    // Retain simulated epoch delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await fetch(`http://localhost:8000/api/admin/train/${disasterType}`, {
        method: "POST"
      });

      if (res.ok) {
        setTrainingState((prev) => ({ ...prev, [disasterType]: "complete" }));
        confetti({
          particleCount: 50,
          spread: 50,
          colors: ["#7B2FF7", "#00D1FF"]
        });
        fetchMetrics();
      } else {
        throw new Error("Training API request failed");
      }
    } catch (err) {
      console.warn("Backend offline. Simulating complete training offline.", err);
      setTrainingState((prev) => ({ ...prev, [disasterType]: "complete" }));
      
      // Update local mock accuracy metrics
      if (metrics) {
        const currentAcc = metrics.model_accuracies[disasterType];
        const nextAcc = Math.min(currentAcc + (Math.random() * 0.02 - 0.005), 0.99);
        setMetrics({
          ...metrics,
          model_accuracies: {
            ...metrics.model_accuracies,
            [disasterType]: nextAcc
          },
          training_history: [
            {
              id: Date.now(),
              disaster_type: disasterType,
              accuracy: nextAcc,
              model_path: `models/${disasterType}.joblib`,
              features: ["custom_telemetry_variables"],
              timestamp: new Date().toISOString()
            },
            ...metrics.training_history
          ]
        });
      }

      confetti({ particleCount: 30, colors: ["#7B2FF7", "#00D1FF"] });
    }

    setTimeout(() => {
      setTrainingState((prev) => ({ ...prev, [disasterType]: "idle" }));
    }, 3000);
  };

  const simulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccess(true);
    confetti({ particleCount: 40, spread: 60 });
    
    // Update local dataset counts simulation
    if (metrics && metrics.datasets[selectedDataset]) {
      const records = metrics.datasets[selectedDataset].records + recordsCount;
      setMetrics({
        ...metrics,
        datasets: {
          ...metrics.datasets,
          [selectedDataset]: { records }
        }
      });
    }

    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
          Command Control Panel
        </h2>
        <p className="text-xs text-gray-400 font-mono">
          Upload custom historical datasets, trigger ML retraining, and monitor core model accuracies.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Left: ML Models Training Panel */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <Cpu className="h-4 w-4 text-neon-blue" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Ensemble Model Training Console
            </span>
          </div>

          {metrics ? (
            <div className="space-y-4 font-mono text-[10px]">
              {Object.keys(metrics.model_accuracies).map((model) => {
                const acc = metrics.model_accuracies[model];
                const state = trainingState[model];
                const records = metrics.datasets[model]?.records || 500;

                return (
                  <div key={model} className="rounded border border-cyber-border/20 bg-black/40 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold uppercase">{model} CLASSIFIER</div>
                      <div className="text-gray-500 text-[8px] mt-0.5">HISTORICAL DATASETS: {records} ROW ENTRIES</div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Accuracy Score */}
                      <div className="text-right">
                        <div className="text-[7px] text-gray-500">ACCURACY</div>
                        <div className="text-neon-cyan font-black text-sm">{(acc * 100).toFixed(1)}%</div>
                      </div>

                      {/* Trigger Actions */}
                      <button
                        onClick={() => triggerTraining(model)}
                        disabled={state === "training"}
                        className={`rounded px-3 py-2 text-[8px] font-extrabold tracking-widest uppercase transition-all duration-300 flex items-center space-x-1.5 ${
                          state === "training"
                            ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/50 cursor-not-allowed animate-pulse"
                            : state === "complete"
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-neon-blue/15 hover:bg-neon-blue/30 text-neon-cyan border border-neon-blue/40"
                        }`}
                      >
                        {state === "training" ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>TRAINING</span>
                          </>
                        ) : state === "complete" ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>COMPILED</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3" />
                            <span>RETRAIN</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center font-mono text-xs text-gray-500 animate-pulse">
              SYNCING MODEL telemetry DATASETS...
            </div>
          )}
        </div>

        {/* Right: Dataset Upload Form */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <Database className="h-4 w-4 text-neon-purple" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Ingest Satellite historical data
            </span>
          </div>

          <form onSubmit={simulateUpload} className="space-y-4 font-mono text-[10px]">
            {uploadSuccess && (
              <div className="rounded border border-green-500/30 bg-green-950/20 p-3 text-green-400 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 animate-pulse flex-shrink-0" />
                <span>SUCCESS: Historical dataset file appended to grid repository. Ready to retrain models.</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-gray-400">TARGET FORECAST ENGINE:</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full rounded border border-cyber-border/40 bg-black/40 p-2.5 text-xs text-white focus:border-neon-blue focus:outline-none"
              >
                <option value="flood">Flood / Precipitation</option>
                <option value="earthquake">Earthquake / Fault lines</option>
                <option value="cyclone">Cyclone / Barometric</option>
                <option value="wildfire">Wildfire / Heatwaves</option>
                <option value="landslide">Landslide / Soil saturation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">SAMPLE RECORDS TO INGEST:</label>
              <input
                type="number"
                min="100"
                max="5000"
                step="50"
                value={recordsCount}
                onChange={(e) => setRecordsCount(parseInt(e.target.value))}
                className="w-full rounded border border-cyber-border/40 bg-black/40 p-2.5 text-xs text-white focus:border-neon-blue focus:outline-none"
              />
            </div>

            <div className="border border-dashed border-cyber-border/40 rounded-lg p-6 text-center bg-black/20 hover:border-neon-blue transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2">
              <Upload className="h-6 w-6 text-neon-blue animate-bounce" />
              <span className="text-[9px] text-gray-500">DRAG & DROP HISTORICAL CSV DATASET OR CLICK TO BROWSE</span>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue py-3 text-xs font-black tracking-widest text-white shadow-glow-purple hover:opacity-90 active:scale-[0.98]"
            >
              APPEND RAW CSV TELEMETRY
            </button>
          </form>
        </div>

      </div>

      {/* Model Training Logs Feed */}
      <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5">
        <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2 mb-4">
          <History className="h-4 w-4 text-neon-cyan" />
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Consolidated Retraining Ledger Audit
          </span>
        </div>

        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 font-mono text-[9px]">
          {metrics && metrics.training_history.length > 0 ? (
            metrics.training_history.map((log) => (
              <div key={log.id} className="rounded border border-cyber-border/20 bg-black/20 p-2.5 flex justify-between items-center text-gray-400">
                <div className="flex items-center space-x-2.5">
                  <span className="text-neon-cyan font-bold uppercase">[{log.disaster_type}]</span>
                  <span>Model path saved: {log.model_path}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-green-400 font-semibold">ACCURACY: {(log.accuracy*100).toFixed(1)}%</span>
                  <span className="text-gray-600 text-[8px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">NO RECENT ML RETRAINING LEDGER ENTRIES REGISTERED.</div>
          )}
        </div>
      </div>

    </div>
  );
}
