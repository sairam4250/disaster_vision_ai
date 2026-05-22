"use client";

import React, { useEffect, useState } from "react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { BarChart3, TrendingUp, Info } from "lucide-react";

// Historical Data Seeds
const climateAnomalies = [
  { year: "2016", anomaly: 0.99, disasters: 280, temp: 14.84 },
  { year: "2017", anomaly: 0.92, disasters: 295, temp: 14.77 },
  { year: "2018", anomaly: 0.85, disasters: 310, temp: 14.70 },
  { year: "2019", anomaly: 0.98, disasters: 335, temp: 14.83 },
  { year: "2020", anomaly: 1.02, disasters: 360, temp: 14.87 },
  { year: "2021", anomaly: 0.89, disasters: 345, temp: 14.74 },
  { year: "2022", anomaly: 0.96, disasters: 380, temp: 14.81 },
  { year: "2023", anomaly: 1.15, disasters: 420, temp: 15.00 },
  { year: "2024", anomaly: 1.22, disasters: 460, temp: 15.07 },
  { year: "2025", anomaly: 1.30, disasters: 495, temp: 15.15 },
  { year: "2026", anomaly: 1.41, disasters: 530, temp: 15.26 },
];

const disasterBreakdown = [
  { name: "Flood", count: 184, increase: "+12%", color: "#00D1FF" },
  { name: "Earthquake", count: 96, increase: "+2%", color: "#FF4D4D" },
  { name: "Cyclone", count: 78, increase: "+24%", color: "#7B2FF7" },
  { name: "Wildfire", count: 122, increase: "+18%", color: "#f97316" },
  { name: "Landslide", count: 50, increase: "+5%", color: "#eab308" },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch on Recharts SVG rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center font-mono text-xs text-gray-500 animate-pulse">
        CALIBRATING ANALYTICAL CHART GRID...
      </div>
    );
  }

  // Custom tooltips styling for charts matching cyberpunk neon colors
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-cyber-border bg-dark-bg/95 p-3 shadow-glow-blue font-mono text-[10px]">
          <p className="text-white font-bold mb-1.5">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color || "#00D1FF" }} className="flex justify-between gap-4">
              <span>{p.name}:</span>
              <span className="font-extrabold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
            Climatological Telemetry Analytics
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Planetary temperature anomalies and disaster frequency correlations over a 10-year period.
          </p>
        </div>
      </div>

      {/* Grid: 2 Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Global Temperature Anomalies & Disasters */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border/20 pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-neon-blue" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Thermal Anomaly vs Disaster Index
              </span>
            </div>
            <span className="font-mono text-[8px] text-gray-500">BASE TEMP: 14.0°C</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={climateAnomalies} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B2FF7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7B2FF7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDisasters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#4b5563" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace", paddingTop: 10 }} />
                <Area 
                  type="monotone" 
                  name="Temp Anomaly (°C)" 
                  dataKey="anomaly" 
                  stroke="#7B2FF7" 
                  fillOpacity={1} 
                  fill="url(#colorAnomaly)" 
                />
                <Area 
                  type="monotone" 
                  name="Disaster Events count" 
                  dataKey="disasters" 
                  stroke="#00D1FF" 
                  fillOpacity={1} 
                  fill="url(#colorDisasters)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Disaster Breakdown Bar Chart */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border/20 pb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-neon-purple" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Regional Classification Breakdown
              </span>
            </div>
            <span className="font-mono text-[8px] text-gray-500">YEAR: 2026 ACTIVE LOGS</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disasterBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Event Count" 
                  fill="#7B2FF7" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Analytics Summary Stats Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {disasterBreakdown.slice(0, 3).map((item, index) => (
          <div key={index} className="rounded-2xl border border-cyber-border/30 bg-black/40 p-4 flex justify-between items-center font-mono">
            <div>
              <div className="text-[8px] text-gray-400 uppercase tracking-widest">{item.name} FREQUENCY INDEX</div>
              <div className="text-xl font-black text-white mt-1">{item.count} events</div>
            </div>
            <div className="text-right">
              <div className="text-neon-red text-xs font-bold">{item.increase}</div>
              <div className="text-[7px] text-gray-500 mt-0.5">Y-O-Y RATIO</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
