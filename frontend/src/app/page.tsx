"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeather } from "@/components/WeatherContext";
import { 
  Eye, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Volume2,
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  PhoneCall
} from "lucide-react";
import confetti from "canvas-confetti";

export default function LandingPage() {
  const { setParticleMode } = useWeather();
  const globeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [simulationActive, setSimulationActive] = useState(false);
  const [soundIndicator, setSoundIndicator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const indianStatesAndUTs = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", 
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttarakhand", "Uttar Pradesh", "West Bengal",
    "Delhi", "Puducherry", "Chandigarh", "Andaman and Nicobar Islands", 
    "Lakshadweep", "Dadra and Nagar Haveli and Daman and Diu"
  ];

  // Trigger ambient particles reset on landing page load
  useEffect(() => {
    setParticleMode("none");
  }, [setParticleMode]);

  // Handle outside click for search suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Canvas Globe implementation (cyberpunk styled)
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = 400);
    let height = (canvas.height = 400);
    const radius = 150;
    const center = { x: width / 2, y: height / 2 };

    let rotationX = 0;
    let rotationY = 0;
    let animationId: number;

    const points: Array<{ x: number; y: number; z: number }> = [];
    const count = 350;
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;

      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const glowGrad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, radius);
      glowGrad.addColorStop(0, "rgba(123, 47, 247, 0.05)");
      glowGrad.addColorStop(1, "rgba(3, 7, 18, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fill();

      const rx = rotationX;
      const ry = rotationY;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      points.forEach((p) => {
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        const k = 400;
        const perspective = k / (k + z2);
        const screenX = center.x + x1 * perspective;
        const screenY = center.y + y2 * perspective;

        if (z2 < 30) {
          const alpha = (radius - z2) / (radius * 2);
          ctx.fillStyle = z2 < -50 
            ? `rgba(0, 209, 255, ${alpha * 0.9})` 
            : `rgba(123, 47, 247, ${alpha * 0.7})`;

          ctx.beginPath();
          ctx.arc(screenX, screenY, perspective * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.strokeStyle = "rgba(0, 209, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, radius, radius * 0.25, rotationX, 0, Math.PI * 2);
      ctx.stroke();

      rotationY += 0.006;
      rotationX += 0.001;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const triggerSimulation = () => {
    if (simulationActive) {
      setSimulationActive(false);
      setParticleMode("none");
    } else {
      setSimulationActive(true);
      setSoundIndicator(true);
      setParticleMode("lightning");
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#00D1FF", "#7B2FF7", "#FF4D4D"],
      });
      setTimeout(() => setSoundIndicator(false), 3500);
    }
  };

  const handleSelectState = (state: string) => {
    router.push(`/dashboard?state=${encodeURIComponent(state)}`);
  };

  const filteredStates = searchQuery
    ? indianStatesAndUTs.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : indianStatesAndUTs;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Simulation active banner */}
      {soundIndicator && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-neon-red/50 bg-red-950/95 px-6 py-3 shadow-glow-red animate-[bounce_0.5s_infinite] font-sans">
          <div className="flex items-center space-x-2 text-xs text-neon-red font-extrabold uppercase tracking-wide">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span>Emergency simulation active. High threat storms simulated.</span>
          </div>
        </div>
      )}

      {/* Main Responsive Grid */}
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        
        {/* Left Side: Headline, Search and Actions */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4.5 py-1.5 font-sans text-xs font-semibold text-neon-cyan tracking-wide">
            <Sparkles className="h-4.5 w-4.5 text-neon-cyan animate-pulse" />
            <span>AI-Powered Early Warning & Safety Portal</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-white">
            India's Smart <br />
            <span className="bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Disaster Alert
            </span> Network
          </h1>
          
          <p className="max-w-md mx-auto lg:mx-0 font-sans text-sm leading-relaxed text-gray-300">
            Check live weather warnings, flood risks, and cyclone forecasts for your area. Get clear step-by-step checklists to keep your family safe.
          </p>

          {/* Interactive Search Box (Citizen Friendly) */}
          <div ref={searchContainerRef} className="relative max-w-md mx-auto lg:mx-0">
            <div className="text-left font-sans text-xs font-bold text-gray-400 mb-2 flex items-center space-x-1.5">
              <span>🔍 SEARCH SAFETY STATUS BY STATE</span>
            </div>
            <div className="relative flex items-center">
              <Search className="absolute left-4.5 h-5 w-5 text-neon-blue animate-pulse" />
              <input
                type="text"
                placeholder="Enter your State (e.g. Uttarakhand, Bihar, Kerala...)"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full rounded-2xl border border-cyber-border/60 bg-dark-bg/90 py-4 pl-12 pr-4 font-sans text-sm text-white placeholder-gray-500 shadow-glow-blue outline-none transition-all duration-300 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
              />
            </div>

            {/* State Search Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-2 z-50 max-h-56 overflow-y-auto rounded-xl border border-cyber-border/80 bg-dark-bg/95 p-1.5 backdrop-blur-xl shadow-2xl">
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => (
                    <button
                      key={state}
                      onClick={() => handleSelectState(state)}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-sans text-xs text-gray-200 hover:bg-neon-blue/20 hover:text-white transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-neon-cyan" />
                        <span className="font-semibold">{state}</span>
                      </div>
                      <span className="font-mono text-[9px] text-gray-500">SELECT STATE ➔</span>
                    </button>
                  ))
                ) : (
                  <div className="py-4 text-center font-sans text-xs text-gray-500">
                    No matching state found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/dashboard"
              className="group w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-7 py-3.5 font-sans text-xs font-bold text-white shadow-glow-blue transition-transform hover:scale-105 active:scale-95"
            >
              <span>OPEN LIVE MAP ALERTS</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              onClick={triggerSimulation}
              className={`w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border px-7 py-3.5 font-sans text-xs font-bold transition-all duration-300 ${
                simulationActive
                  ? "border-neon-red/50 bg-neon-red/10 text-neon-red"
                  : "border-cyber-border/80 bg-white/5 text-gray-300 hover:border-neon-blue hover:text-white"
              }`}
            >
              <Play className={`h-4 w-4 ${simulationActive ? "animate-pulse" : ""}`} />
              <span>{simulationActive ? "STOP WEATHER STORM" : "SIMULATE MONSOON STORM"}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Visual Globe representation */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative flex h-[350px] w-[350px] items-center justify-center rounded-full border border-cyber-border/20 bg-black/20 backdrop-blur-sm">
            
            <canvas ref={globeCanvasRef} className="absolute inset-0 h-full w-full" />
            
            <div className="pointer-events-none absolute inset-0 rounded-full border border-neon-blue/15 bg-radial-gradient from-transparent to-black/40 shadow-[inset_0_0_20px_rgba(0,209,255,0.05)]" />
            
            <div className="pointer-events-none absolute h-[106%] w-[106%] rounded-full border border-dashed border-cyber-border/10 animate-[spin_50s_linear_infinite]" />
            <div className="pointer-events-none absolute h-[112%] w-[112%] rounded-full border border-dotted border-cyber-border/5 animate-[spin_80s_linear_infinite_reverse]" />
            
            <div className="absolute font-sans text-[9px] text-neon-cyan font-bold tracking-widest bottom-4 uppercase">
              INDIA HAZARD MATRIX MAPPED
            </div>
          </div>
          
          {/* Quick HUD Metrics */}
          <div className="grid w-full grid-cols-3 gap-3 max-w-md font-sans text-center">
            <div className="rounded-xl border border-cyber-border/30 bg-black/55 p-3">
              <div className="text-neon-cyan text-sm font-extrabold">98.4%</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Prediction Confidence</div>
            </div>
            <div className="rounded-xl border border-cyber-border/30 bg-black/55 p-3">
              <div className="text-neon-purple text-sm font-extrabold">36 Zones</div>
              <div className="text-[9px] text-gray-400 mt-0.5">States Monitored</div>
            </div>
            <div className="rounded-xl border border-cyber-border/30 bg-black/55 p-3">
              <div className="text-neon-red text-sm font-extrabold">&lt; 2 Sec</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Alert Response</div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid bottom cards explaining benefits simply */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-16 font-sans">
        
        <div className="rounded-2xl border border-cyber-border/30 bg-dark-bg/60 p-5 hover:border-neon-cyan/40 hover:bg-neon-cyan/5 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Live Warnings</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            See active flood alerts in Assam, landslide warnings in Uttarakhand, and heatwaves in Maharashtra on an interactive map.
          </p>
        </div>

        <div className="rounded-2xl border border-cyber-border/30 bg-dark-bg/60 p-5 hover:border-neon-purple/40 hover:bg-neon-purple/5 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">AI Disaster Simulator</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Click presets like "Cloudburst" or "Cyclone Landfall" to test weather parameters and see how the AI rates risk levels instantly.
          </p>
        </div>

        <div className="rounded-2xl border border-cyber-border/30 bg-dark-bg/60 p-5 hover:border-neon-red/40 hover:bg-neon-red/5 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-neon-red/10 border border-neon-red/20 flex items-center justify-center text-neon-red">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Emergency SOS Unit</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Quickly trigger an emergency rescue signal, list nearby active shelters, and check offline survival checklists for disaster events.
          </p>
        </div>

      </div>

    </div>
  );
}
