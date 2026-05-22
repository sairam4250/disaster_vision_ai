"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useWeather } from "@/components/WeatherContext";
import { Eye, ShieldAlert, Activity, Sparkles, ChevronRight, Play, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function LandingPage() {
  const { setParticleMode } = useWeather();
  const globeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [soundIndicator, setSoundIndicator] = useState(false);

  // Trigger ambient particles reset on landing page load
  useEffect(() => {
    setParticleMode("none");
  }, [setParticleMode]);

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

    // Create dot coordinates around sphere
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

      // Sphere ambient glow back
      const glowGrad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, radius);
      glowGrad.addColorStop(0, "rgba(123, 47, 247, 0.05)");
      glowGrad.addColorStop(1, "rgba(3, 7, 18, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Rotate points
      const rx = rotationX;
      const ry = rotationY;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      // Render points
      points.forEach((p) => {
        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate around X axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // 3D Perspective projection
        const k = 400; // perspective depth
        const perspective = k / (k + z2);
        const screenX = center.x + x1 * perspective;
        const screenY = center.y + y2 * perspective;

        // Don't render points behind the sphere center
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

      // Draw equator ring
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
      // Turn background weather system to lightning storm mode
      setParticleMode("lightning");
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#00D1FF", "#7B2FF7", "#FF4D4D"],
      });
      // Deactivate sound indicator overlay after 3 seconds
      setTimeout(() => setSoundIndicator(false), 3500);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Simulation status flash banner */}
      {soundIndicator && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-neon-red/50 bg-red-950/90 px-6 py-3 shadow-glow-red animate-[bounce_0.5s_infinite]">
          <div className="flex items-center space-x-2 font-mono text-xs text-neon-red font-bold uppercase tracking-wider">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span>WARNING: Cinematic Simulation Active. Atmospheric anomaly detected.</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        
        {/* Left: Headline & Callouts */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 rounded-full border border-neon-blue/30 bg-neon-blue/5 px-4 py-1.5 font-mono text-[10px] tracking-wider text-neon-cyan shadow-[0_0_10px_rgba(0,209,255,0.05)]">
            <Sparkles className="h-3 w-3 text-neon-cyan animate-pulse" />
            <span>NEXT-GEN ENVIRONMENTAL PREDICTIVE INTELLIGENCE</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Predict <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent neon-text-blue">Tomorrow</span>, <br />
            Save Today.
          </h1>
          
          <p className="max-w-md mx-auto lg:mx-0 font-mono text-xs leading-relaxed text-gray-400">
            DisasterVision AI maps planetary stress points using ensemble neural structures. Compute real-time atmospheric threat vectors before landfall occurs.
          </p>

          {/* Slogan details / Features list */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0 text-left font-mono text-[10px]">
            <div className="flex items-center space-x-2 rounded border border-cyber-border/20 bg-white/5 p-2">
              <ShieldAlert className="h-4 w-4 text-neon-red" />
              <span>5 Threat Classes</span>
            </div>
            <div className="flex items-center space-x-2 rounded border border-cyber-border/20 bg-white/5 p-2">
              <Activity className="h-4 w-4 text-neon-cyan" />
              <span>Real-time Radar</span>
            </div>
          </div>

          {/* Primary Gate Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center space-x-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 font-mono text-xs font-bold text-white shadow-glow-blue transition-transform hover:scale-105 active:scale-95"
            >
              <span>ACCESS COMMAND CONSOLE</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              onClick={triggerSimulation}
              className={`flex items-center space-x-2 rounded-lg border px-6 py-3 font-mono text-xs font-bold transition-all duration-300 ${
                simulationActive
                  ? "border-neon-red/50 bg-neon-red/10 text-neon-red"
                  : "border-cyber-border/80 bg-white/5 text-gray-300 hover:border-neon-blue hover:text-white"
              }`}
            >
              <Play className={`h-4 w-4 ${simulationActive ? "animate-pulse" : ""}`} />
              <span>{simulationActive ? "RESET TELEMETRY" : "RUN WEATHER SCENARIO"}</span>
            </button>
          </div>
        </div>

        {/* Right: Globe and Stats */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative flex h-[360px] w-[360px] items-center justify-center rounded-full border border-cyber-border/20 bg-black/20 backdrop-blur-sm">
            {/* Spinning vector globe */}
            <canvas ref={globeCanvasRef} className="absolute inset-0 h-full w-full" />
            
            {/* Scanning radar sweep overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-full border border-neon-blue/10 bg-radial-gradient from-transparent to-black/40 shadow-[inset_0_0_20px_rgba(0,209,255,0.05)]" />
            
            {/* HUD Rings */}
            <div className="pointer-events-none absolute h-[110%] w-[110%] rounded-full border border-dashed border-cyber-border/10 animate-[spin_40s_linear_infinite]" />
            <div className="pointer-events-none absolute h-[115%] w-[115%] rounded-full border border-dotted border-cyber-border/5 animate-[spin_60s_linear_infinite_reverse]" />
            
            <div className="absolute font-mono text-[8px] text-neon-cyan tracking-widest bottom-2">
              PLANETARY COORDINATES: SECURED
            </div>
          </div>
          
          {/* Quick HUD Metrics */}
          <div className="grid w-full grid-cols-3 gap-3 max-w-md font-mono text-center">
            <div className="rounded-lg border border-cyber-border/30 bg-black/40 p-2.5">
              <div className="text-neon-blue text-sm font-extrabold">98.4%</div>
              <div className="text-[7px] text-gray-400 mt-0.5">MODEL ACCURACY</div>
            </div>
            <div className="rounded-lg border border-cyber-border/30 bg-black/40 p-2.5">
              <div className="text-neon-purple text-sm font-extrabold">500+</div>
              <div className="text-[7px] text-gray-400 mt-0.5">SENSORS ON GRID</div>
            </div>
            <div className="rounded-lg border border-cyber-border/30 bg-black/40 p-2.5">
              <div className="text-neon-red text-sm font-extrabold">&lt; 2 MIN</div>
              <div className="text-[7px] text-gray-400 mt-0.5">ALERT LATENCY</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
