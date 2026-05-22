"use client";

import React, { useState, useEffect } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import RadarScanner from "@/components/RadarScanner";
import { useWeather } from "@/components/WeatherContext";
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  Activity,
  AlertTriangle,
  Radio,
  FileText,
  Search
} from "lucide-react";

interface WeatherData {
  region: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  rainfall: number;
  drought_index: number;
  seismic_activity: number;
  soil_moisture: number;
  satellite_overlay: {
    storm_radar_visual: boolean;
    wildfire_thermal_hotspots: boolean;
    cloud_density_percent: number;
  };
}

interface AlertFeedItem {
  id: number;
  type: string;
  severity: string;
  region: string;
  message: string;
  timestamp: string;
  active: number;
}

export default function DashboardPage() {
  const { setParticleMode } = useWeather();
  const [selectedRegion, setSelectedRegion] = useState("Bay of Bengal (Odisha Coast)");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<AlertFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch weather for selected region
  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/weather/${encodeURIComponent(selectedRegion)}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
          
          // Dynamically adjust ambient particle system based on meteorological stats
          if (data.wind_speed > 100) {
            setParticleMode("storm");
          } else if (data.temperature > 35 && data.humidity < 25) {
            setParticleMode("smoke");
          } else if (data.rainfall > 100) {
            setParticleMode("lightning");
          } else if (data.rainfall > 20) {
            setParticleMode("rain");
          } else {
            setParticleMode("none");
          }
        }
      } catch (err) {
        console.warn("Backend API not reachable. Loading mock weather fallback.", err);
        // Fallback mock weather patterns for India adaptation regions
        let mockData: WeatherData = {
          region: selectedRegion,
          temperature: 28.5,
          humidity: 82.0,
          wind_speed: 45.0,
          pressure: 1008.0,
          rainfall: 22.0,
          drought_index: 2.1,
          seismic_activity: 1.2,
          soil_moisture: 65.0,
          satellite_overlay: { storm_radar_visual: false, wildfire_thermal_hotspots: false, cloud_density_percent: 60 }
        };

        if (selectedRegion.includes("Western Ghats") || selectedRegion.includes("Maharashtra") || selectedRegion.includes("Wghats")) {
          mockData = {
            region: selectedRegion,
            temperature: 43.5,
            humidity: 12.0,
            wind_speed: 48.0,
            pressure: 1005.0,
            rainfall: 0.0,
            drought_index: 8.8,
            seismic_activity: 0.5,
            soil_moisture: 15.0,
            satellite_overlay: { storm_radar_visual: false, wildfire_thermal_hotspots: true, cloud_density_percent: 15 }
          };
          setParticleMode("smoke");
        } else if (selectedRegion.includes("Bengal") || selectedRegion.includes("Odisha")) {
          mockData = {
            region: selectedRegion,
            temperature: 29.5,
            pressure: 945.0,
            wind_speed: 215.0,
            humidity: 92.0,
            rainfall: 185.0,
            drought_index: 1.0,
            seismic_activity: 0.8,
            soil_moisture: 95.0,
            satellite_overlay: { storm_radar_visual: true, wildfire_thermal_hotspots: false, cloud_density_percent: 100 }
          };
          setParticleMode("storm");
        } else if (selectedRegion.includes("Brahmaputra") || selectedRegion.includes("Assam")) {
          mockData = {
            region: selectedRegion,
            temperature: 23.5,
            humidity: 98.0,
            wind_speed: 25.0,
            pressure: 1002.0,
            rainfall: 420.0,
            drought_index: 1.0,
            seismic_activity: 0.3,
            soil_moisture: 99.0,
            satellite_overlay: { storm_radar_visual: false, wildfire_thermal_hotspots: false, cloud_density_percent: 100 }
          };
          setParticleMode("lightning");
        } else if (selectedRegion.includes("Himalaya") || selectedRegion.includes("Uttarakhand")) {
          mockData = {
            region: selectedRegion,
            temperature: 18.2,
            humidity: 94.0,
            wind_speed: 15.0,
            pressure: 1008.0,
            rainfall: 140.0,
            drought_index: 1.2,
            seismic_activity: 1.8,
            soil_moisture: 92.0,
            satellite_overlay: { storm_radar_visual: false, wildfire_thermal_hotspots: false, cloud_density_percent: 90 }
          };
          setParticleMode("rain");
        } else if (selectedRegion.includes("Kachchh") || selectedRegion.includes("Gujarat")) {
          mockData = {
            region: selectedRegion,
            temperature: 32.4,
            humidity: 45.0,
            wind_speed: 20.0,
            pressure: 1010.0,
            rainfall: 2.0,
            drought_index: 4.5,
            seismic_activity: 6.2,
            soil_moisture: 35.0,
            satellite_overlay: { storm_radar_visual: false, wildfire_thermal_hotspots: false, cloud_density_percent: 40 }
          };
          setParticleMode("none");
        }
        
        setWeather(mockData);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [selectedRegion, setParticleMode]);

  // Fetch active alerts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("http://localhost:8000/api/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.warn("Backend API not reachable. Loading mock alerts fallback.", err);
        // Fallback mock alerts
        const mockAlerts: AlertFeedItem[] = [
          { id: 1, type: "Cyclone", severity: "Critical", region: "Indian Ocean / Bay of Bengal", message: "Cyclone 'Amphan II' forming. Sustained wind speeds exceeding 210 km/h. Evacuate low-lying areas.", timestamp: new Date().toISOString(), active: 1 },
          { id: 2, type: "Wildfire", severity: "High", region: "Western Australia / California Coast", message: "Wildfire spreading rapidly due to 42°C temp and 45 knot gusts. Containment at 5%.", timestamp: new Date().toISOString(), active: 1 },
          { id: 3, type: "Flood", severity: "High", region: "Brahmaputra Basin, India", message: "River levels breached critical thresholds. Heavy monsoon rainfall (350mm) forecasted for next 48 hrs.", timestamp: new Date().toISOString(), active: 1 },
        ];
        setAlerts(mockAlerts);
      }
    }
    fetchAlerts();
  }, []);

  const getSeverityBg = (sev: string) => {
    switch (sev) {
      case "Critical": return "border-neon-red/50 text-neon-red bg-red-950/40";
      case "High": return "border-orange-500/50 text-orange-400 bg-orange-950/40";
      default: return "border-yellow-500/50 text-yellow-400 bg-yellow-950/40";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Section Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
            Disaster telemetry matrix
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Active Station: <span className="text-neon-cyan">{selectedRegion}</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Left Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* World Map Dashboard - Spans 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <InteractiveMap onSelectRegion={setSelectedRegion} />
          
          {/* Anomaly Live Alerts Feed Log */}
          <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-4">
            <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2 mb-3">
              <Radio className="h-4 w-4 text-neon-red animate-pulse" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Live Anomaly Event Log Feed
              </span>
            </div>

            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 font-mono text-[10px]">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-2 rounded border p-2.5 transition-colors ${getSeverityBg(alert.severity)}`}
                >
                  <div className="flex items-start md:items-center space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 md:mt-0 flex-shrink-0" />
                    <div>
                      <span className="font-extrabold uppercase mr-1">[{alert.type}]</span>
                      <span className="text-gray-300">{alert.message}</span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-[8px] flex-shrink-0 whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Real-time Weather Telemetry + Radar Scanner */}
        <div className="space-y-6">
          
          {/* Real-time Weather Widget */}
          <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-4">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider border-b border-cyber-border/20 pb-2 mb-4 flex items-center justify-between">
              <span>METEOROLOGICAL SENSORS</span>
              {loading && <span className="h-2 w-2 rounded-full bg-neon-cyan animate-ping" />}
            </h3>

            {weather ? (
              <div className="grid grid-cols-2 gap-4">
                
                {/* Temp */}
                <div className="rounded border border-cyber-border/20 bg-white/5 p-3 flex items-center space-x-3">
                  <div className="text-neon-red">
                    <Thermometer className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] text-gray-400">TEMPERATURE</div>
                    <div className="font-mono text-base font-extrabold text-white">{weather.temperature}°C</div>
                  </div>
                </div>

                {/* Humidity */}
                <div className="rounded border border-cyber-border/20 bg-white/5 p-3 flex items-center space-x-3">
                  <div className="text-neon-blue">
                    <Droplets className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] text-gray-400">HUMIDITY</div>
                    <div className="font-mono text-base font-extrabold text-white">{weather.humidity}%</div>
                  </div>
                </div>

                {/* Wind */}
                <div className="rounded border border-cyber-border/20 bg-white/5 p-3 flex items-center space-x-3">
                  <div className="text-neon-cyan">
                    <Wind className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] text-gray-400">WIND SPEED</div>
                    <div className="font-mono text-base font-extrabold text-white">{weather.wind_speed} km/h</div>
                  </div>
                </div>

                {/* Rainfall */}
                <div className="rounded border border-cyber-border/20 bg-white/5 p-3 flex items-center space-x-3">
                  <div className="text-blue-400">
                    <CloudRain className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-mono text-[8px] text-gray-400">PRECIPITATION</div>
                    <div className="font-mono text-base font-extrabold text-white">{weather.rainfall} mm</div>
                  </div>
                </div>

                {/* Soil moisture */}
                <div className="col-span-2 font-mono text-[9px] border-t border-cyber-border/20 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SOIL SATURATION:</span>
                    <span className="text-neon-cyan font-bold">{weather.soil_moisture}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded border border-cyber-border/30 overflow-hidden">
                    <div 
                      className="h-full bg-neon-cyan transition-all duration-500" 
                      style={{ width: `${weather.soil_moisture}%` }}
                    />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-gray-400">ATMOSPHERIC PRESSURE:</span>
                    <span className="text-white">{weather.pressure} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SEISMIC ANOMALY DEPTH:</span>
                    <span className="text-neon-purple font-semibold">{weather.seismic_activity} ML</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-48 flex items-center justify-center font-mono text-xs text-gray-500 animate-pulse">
                INITIALIZING CORE METRICS...
              </div>
            )}
          </div>

          {/* Radar Sweep Simulator Component */}
          <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-4 h-72 flex flex-col justify-between">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider border-b border-cyber-border/20 pb-2 flex items-center justify-between">
              <span>SATELLITE SPECTRUM TRACKING</span>
              <span className="text-[8px] text-neon-blue font-mono font-normal">ORBITER: NASA-V4</span>
            </h3>
            <div className="flex-1">
              <RadarScanner />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
