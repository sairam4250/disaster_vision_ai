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
  { id: "na-wildfire", name: "California Coast, USA", lat: 36.7783, lng: -119.4179, x: 20, y: 35, disasterType: "Wildfire", severity: "High", risk: 85, desc: "High atmospheric drought index. High dry winds." },
  { id: "sa-landslide", name: "Amazon Slope Basin, Peru", lat: -9.19, lng: -75.0152, x: 30, y: 68, disasterType: "Landslide", severity: "Moderate", risk: 58, desc: "Soil water saturation level: 92% after prolonged precipitation." },
  { id: "jp-earthquake", name: "Honshu Shore, Japan", lat: 36.2048, lng: 138.2529, x: 82, y: 35, disasterType: "Earthquake", severity: "Moderate", risk: 62, desc: "Plate boundary seismic stress anomaly. M6.1 recorded." },
  { id: "in-flood", name: "Brahmaputra Basin, India", lat: 26.14, lng: 91.73, x: 70, y: 45, disasterType: "Flood", severity: "High", risk: 89, desc: "River level breached critical thresholds (12m overflow)." },
  { id: "au-wildfire", name: "Western Australia", lat: -25.2744, lng: 133.7751, x: 80, y: 75, disasterType: "Wildfire", severity: "Critical", risk: 96, desc: "Heat wave conditions (44°C). Low relative humidity." },
  { id: "ph-cyclone", name: "Bay of Bengal / Indian Ocean", lat: 14.5995, lng: 120.9842, x: 74, y: 55, disasterType: "Cyclone", severity: "Critical", risk: 94, desc: "Super cyclone 'Amphan II' forming. Sustained wind 210 km/h." },
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
            Global Hazard Monitoring Grid
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 font-mono text-[10px] text-gray-400">
            <span className="h-2 w-2 rounded-full bg-neon-red animate-ping" />
            <span className="text-neon-red font-bold">2 Critical Threats</span>
          </span>
        </div>
      </div>

      {/* SVG Stylized Cyber World Map */}
      <div className="relative mt-4 flex items-center justify-center">
        <svg
          viewBox="0 0 100 80"
          className="w-full max-w-[900px] select-none opacity-80"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Abstract Cyber Grid / Continents wireframe */}
          {/* Stylized background lines */}
          <path
            d="M 5,40 Q 25,10 50,40 T 95,40"
            fill="none"
            stroke="rgba(0, 209, 255, 0.05)"
            strokeWidth="0.5"
          />
          <path
            d="M 5,20 Q 25,60 50,20 T 95,20"
            fill="none"
            stroke="rgba(123, 47, 247, 0.04)"
            strokeWidth="0.5"
          />

          {/* Simple Vector Silhouette of Continents */}
          {/* North America */}
          <path
            d="M 12,22 L 24,20 L 26,28 L 22,35 L 20,38 L 15,35 L 10,28 Z"
            fill="rgba(255, 255, 255, 0.02)"
            stroke="rgba(0, 209, 255, 0.1)"
            strokeWidth="0.5"
          />
          {/* South America */}
          <path
            d="M 22,45 L 28,48 L 32,55 L 29,72 L 26,75 L 24,62 L 20,52 Z"
            fill="rgba(255, 255, 255, 0.02)"
            stroke="rgba(0, 209, 255, 0.1)"
            strokeWidth="0.5"
          />
          {/* Africa */}
          <path
            d="M 42,42 L 52,40 L 56,48 L 52,65 L 48,68 L 45,55 L 40,48 Z"
            fill="rgba(255, 255, 255, 0.02)"
            stroke="rgba(0, 209, 255, 0.1)"
            strokeWidth="0.5"
          />
          {/* Eurasia */}
          <path
            d="M 40,20 L 55,18 L 78,16 L 86,22 L 88,38 L 74,45 L 68,36 L 58,40 L 44,30 Z"
            fill="rgba(255, 255, 255, 0.02)"
            stroke="rgba(0, 209, 255, 0.1)"
            strokeWidth="0.5"
          />
          {/* Australia */}
          <path
            d="M 78,65 L 86,64 L 84,74 L 75,72 Z"
            fill="rgba(255, 255, 255, 0.02)"
            stroke="rgba(0, 209, 255, 0.1)"
            strokeWidth="0.5"
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
                    r={isHovered ? 4 : 2.5}
                    fill="none"
                    stroke={node.severity === "Critical" ? "#FF4D4D" : "#f97316"}
                    strokeWidth="0.4"
                    className="animate-ping"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />
                )}

                {/* Main Node Point */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 1.8 : 1.2}
                  className={`${getSeverityColor(node.severity)} transition-all duration-300`}
                />

                {/* Target box bracket on hover */}
                {isHovered && (
                  <rect
                    x={node.x - 3}
                    y={node.y - 3}
                    width={6}
                    height={6}
                    fill="none"
                    stroke="#00D1FF"
                    strokeWidth="0.25"
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
                    <span className="font-mono text-[9px] text-gray-400">TARGET TARGET_LOCK</span>
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
                      CLICK TO SELECT STATION &gt;
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
        <div>ORBITAL LAT: 24.628 // LONG: 121.054</div>
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
