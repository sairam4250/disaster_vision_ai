"use client";

import React, { useState } from "react";
import { Shield, Radio, Activity, AlertTriangle } from "lucide-react";

interface ThreatNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  x: number; // percentage coordinate on SVG
  y: number;
  disasterType: string;
  severity: "Low" | "Moderate" | "High" | "Critical";
  risk: number;
  desc: string;
}

const threatNodes: ThreatNode[] = [
  { id: "in-himalaya-landslide", name: "Himalayan Landslide Belt (Uttarakhand)", lat: 30.0668, lng: 79.0193, x: 50, y: 22, disasterType: "Landslide", severity: "Moderate", risk: 62, desc: "Monsoon rains triggered slope saturation at 94% on Uttarakhand highway corridors. High debris flow warnings active." },
  { id: "in-brahmaputra-flood", name: "Brahmaputra Basin (Assam)", lat: 26.14, lng: 91.73, x: 84, y: 38, disasterType: "Flood", severity: "High", risk: 89, desc: "River levels breached critical thresholds in Assam. Intense monsoonal downpours (420mm) expected over 48 hours." },
  { id: "in-bayofbengal-cyclone", name: "Bay of Bengal (Odisha Coast)", lat: 20.2724, lng: 85.8338, x: 67, y: 55, disasterType: "Cyclone", severity: "Critical", risk: 94, desc: "Super Cyclone 'Amphan II' forming. Sustained wind speeds exceeding 210 km/h. Evacuation active for coastal lowlands." },
  { id: "in-kachchh-earthquake", name: "Kachchh Seismic Fault (Bhuj, Gujarat)", lat: 23.2504, lng: 69.6693, x: 23, y: 48, disasterType: "Earthquake", severity: "Moderate", risk: 58, desc: "M 5.8 earthquake registered along the Kachchh rift zone. Pre-shocks detected, structural inspections advised." },
  { id: "in-wghats-wildfire", name: "Western Ghats Forest Zone (Maharashtra)", lat: 18.5204, lng: 73.8567, x: 38, y: 64, disasterType: "Wildfire", severity: "High", risk: 82, desc: "Forest fires detected in Western Ghats deciduous slopes due to dry heatwave and 43°C temperatures." },
];

interface InteractiveMapProps {
  onSelectRegion: (regionName: string) => void;
}

export default function InteractiveMap({ onSelectRegion }: InteractiveMapProps) {
  const [selectedNode, setSelectedNode] = useState<ThreatNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ThreatNode | null>(null);

  const handleNodeClick = (node: ThreatNode) => {
    setSelectedNode(node);
    onSelectRegion(node.name);
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Critical": return "fill-neon-red stroke-neon-red shadow-glow-red";
      case "High": return "fill-orange-500 stroke-orange-500";
      case "Moderate": return "fill-yellow-500 stroke-yellow-500";
      default: return "fill-neon-blue stroke-neon-blue";
    }
  };

  const getSeverityBg = (sev: string) => {
    switch (sev) {
      case "Critical": return "bg-red-950/80 border-neon-red/50 text-neon-red";
      case "High": return "bg-orange-950/80 border-orange-500/50 text-orange-400";
      case "Moderate": return "bg-yellow-950/80 border-yellow-500/50 text-yellow-400";
      default: return "bg-blue-950/80 border-neon-blue/50 text-neon-blue";
    }
  };

  return (
    <div className="relative h-full min-h-[350px] w-full rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-4">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/20 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-neon-blue animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-widest text-neon-blue uppercase">
            Indian Subcontinent Threat Matrix
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 font-mono text-[10px] text-gray-400">
            <span className="h-2 w-2 rounded-full bg-neon-red animate-ping" />
            <span className="text-neon-red font-bold">1 Active Critical Hazard</span>
          </span>
        </div>
      </div>

      {/* SVG Stylized Cyber India Map */}
      <div className="relative mt-4 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full max-w-[500px] select-none opacity-80"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Abstract Grid background */}
          <line x1="10" y1="0" x2="10" y2="100" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="70" y1="0" x2="70" y2="100" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="90" y1="0" x2="90" y2="100" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          
          <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />
          <line x1="0" y1="90" x2="100" y2="90" stroke="rgba(0, 209, 255, 0.02)" strokeWidth="0.2" />

          {/* Simple Vector Silhouette of India */}
          <path
            d="M 48,5 L 55,6 L 58,12 L 52,16 L 55,23 L 70,32 L 73,31 L 75,33 L 73,35 L 77,33 L 80,33 L 79,36 L 88,32 L 92,34 L 90,38 L 88,38 L 88,48 L 84,48 L 84,42 L 82,45 L 80,40 L 74,46 L 71,50 L 66,56 L 62,62 L 58,70 L 55,76 L 53,82 L 50,88 L 49,92 L 45,85 L 44,80 L 45,75 L 42,70 L 40,65 L 38,60 L 37,55 L 32,52 L 24,52 L 20,48 L 22,45 L 28,42 L 32,45 L 28,38 L 30,30 L 34,25 L 40,20 L 42,12 Z"
            fill="rgba(0, 209, 255, 0.02)"
            stroke="rgba(0, 209, 255, 0.15)"
            strokeWidth="0.6"
          />
          {/* Sri Lanka */}
          <path
            d="M 54,92 L 57,93 L 56,96 L 53,95 Z"
            fill="rgba(0, 209, 255, 0.02)"
            stroke="rgba(0, 209, 255, 0.15)"
            strokeWidth="0.6"
          />

          {/* Interactive Threat Nodes */}
          {threatNodes.map((node) => {
            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              >
                {/* Outer Ripple Effect for Critical/High */}
                {(node.severity === "Critical" || node.severity === "High") && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? 6 : 4}
                    fill="none"
                    stroke={node.severity === "Critical" ? "#FF4D4D" : "#f97316"}
                    strokeWidth="0.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />
                )}

                {/* Main Node Point */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 3 : 2}
                  className={`${getSeverityColor(node.severity)} transition-all duration-300`}
                />

                {/* Target box bracket on hover */}
                {isHovered && (
                  <rect
                    x={node.x - 5}
                    y={node.y - 5}
                    width={10}
                    height={10}
                    fill="none"
                    stroke="#00D1FF"
                    strokeWidth="0.4"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip Info Overlay */}
        {(hoveredNode || selectedNode) && (
          <div className="absolute right-4 bottom-4 w-72 rounded-lg border glass-panel p-3 shadow-2xl transition-all duration-300 z-10">
            {(() => {
              const node = hoveredNode || selectedNode!;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-gray-400">STATION LOCK</span>
                    <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold border ${getSeverityBg(node.severity)}`}>
                      {node.severity}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{node.name}</h4>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                    <div className="text-gray-400">Anomaly:</div>
                    <div className="text-neon-cyan font-semibold">{node.disasterType}</div>
                    <div className="text-gray-400">Risk Meter:</div>
                    <div className="text-neon-red font-semibold">{node.risk}%</div>
                    <div className="text-gray-400">Coordinates:</div>
                    <div className="text-gray-300">{node.lat.toFixed(2)}°N, {node.lng.toFixed(2)}°E</div>
                  </div>
                  <p className="border-t border-cyber-border/20 pt-1.5 font-mono text-[9px] text-gray-400 leading-normal">
                    {node.desc}
                  </p>
                  <div className="flex justify-end pt-1">
                    <span className="font-mono text-[8px] text-neon-blue animate-pulse">
                      CLICK TO CONNECT TELEMETRY &gt;
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Footer Info bar */}
      <div className="mt-4 flex flex-wrap justify-between gap-2 font-mono text-[9px] text-gray-400">
        <div>SUB-REGIONAL METEOROLOGICAL COORDINATES</div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center"><span className="mr-1 h-1.5 w-1.5 rounded-full bg-neon-red" /> CRITICAL</span>
          <span className="flex items-center"><span className="mr-1 h-1.5 w-1.5 rounded-full bg-orange-500" /> HIGH</span>
          <span className="flex items-center"><span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500" /> MODERATE</span>
          <span className="flex items-center"><span className="mr-1 h-1.5 w-1.5 rounded-full bg-neon-blue" /> LOW</span>
        </div>
      </div>
    </div>
  );
}
