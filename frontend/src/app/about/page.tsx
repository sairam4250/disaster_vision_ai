"use client";

import React from "react";
import { Info, Shield, Server, FileText, Database, Code } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
          Meteorological Station Details
        </h2>
        <p className="text-xs text-gray-400 font-mono">
          Overview of mathematical models, sensor citations, and environmental telemetry architectures.
        </p>
      </div>

      {/* Grid: Overview cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Machine learning models details */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-4">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider border-b border-cyber-border/20 pb-2 flex items-center space-x-2">
            <Code className="h-4 w-4 text-neon-blue" />
            <span>AI Predictive Architecture</span>
          </h3>
          
          <div className="font-mono text-[10px] text-gray-400 space-y-3 leading-relaxed">
            <p>
              <strong className="text-white">Ensemble Random Forests:</strong> Disaster classification layers run multi-estimator decision tree algorithms. By dividing inputs (e.g. soil saturation, wind velocity gradients, barometric anomalies) across 100+ estimators, variance is minimized, and out-of-bag error rates remain below 4.5%.
            </p>
            <p>
              <strong className="text-white">Classification Thresholds:</strong> Risk percentages are evaluated through probability distribution vectors:
            </p>
            <div className="bg-black/40 p-2.5 rounded border border-cyber-border/20 text-[9px] text-neon-cyan leading-normal font-mono">
              Risk Index (Rd) = Σ [ P(c) × Wc ]
              <div className="mt-1 text-gray-400">
                Where P(c) is class likelihood probability and Wc is severity weight multiplier (Low=10, Moderate=40, High=75, Critical=100).
              </div>
            </div>
          </div>
        </div>

        {/* Citations APIs details */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-4">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider border-b border-cyber-border/20 pb-2 flex items-center space-x-2">
            <Database className="h-4 w-4 text-neon-purple" />
            <span>Data Ingestion & APIs Citations</span>
          </h3>

          <div className="font-mono text-[10px] text-gray-400 space-y-4 leading-relaxed">
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-neon-cyan mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-white">OpenWeather API Feed:</strong> Ingests live barometric pressure, dew point coordinates, humidity values, and surface wind vectors.
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-neon-purple mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-white">NASA Earth Data & MODIS:</strong> Citations for soil saturation levels, vegetation density thresholds, thermal anomaly points, and cyclone tracking telemetry.
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-neon-blue mt-1.5 flex-shrink-0" />
              <div>
                <strong className="text-white">Google Maps Vector Grid:</strong> Provides the geolocation layers and distance metrics to faulter plate zones and local emergency safe-haven shelters.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Security compliance panel */}
      <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-3 font-mono text-[9px] text-gray-400">
        <div className="flex items-center space-x-2 text-white font-bold border-b border-cyber-border/20 pb-2 mb-2">
          <Shield className="h-4 w-4 text-neon-cyan animate-pulse" />
          <span>PLANETARY SHIELD INITIATIVE COMPLIANCE</span>
        </div>
        <p className="leading-relaxed">
          DisasterVision AI is compiled under local environmental monitoring protocol standards. The ML predictions are intended as analytical advisory frameworks. Telemetry models should be validated against official National Meteorological agency advisories prior to execution of structural evacuation maneuvers.
        </p>
      </div>

    </div>
  );
}
