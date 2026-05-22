"use client";

import React from "react";
import Sidebar from "./Sidebar";
import ParticleSystem from "./ParticleSystem";
import { useWeather } from "./WeatherContext";
import { Radio, Heart, Cpu } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { particleMode } = useWeather();

  return (
    <div className="relative flex min-h-screen bg-dark-bg text-foreground cyber-grid">
      {/* Background Weather Canvas */}
      <ParticleSystem mode={particleMode} />

      {/* Soft Vignette effect instead of heavy CRT lines */}
      <div className="pointer-events-none fixed inset-0 z-10 h-full w-full bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.4)_100%)]" />
      
      {/* Scanning bar animation */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-[2px] w-full bg-neon-blue/20 shadow-glow-blue animate-scan" />

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="relative flex flex-1 flex-col md:pl-72 z-20">
        
        {/* Global Dashboard Top Status Bar */}
        <header className="flex h-20 items-center justify-between border-b border-cyber-border/10 bg-dark-bg/40 px-6 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Radio className="h-4 w-4 text-neon-blue animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-gray-400">
              ORBITAL TRANSMISSION FEED: ACTIVE
            </span>
          </div>
          <div className="flex items-center space-x-6">
            {/* Audio Wave Feedback Visualiser Mockup */}
            <div className="hidden items-center space-x-0.5 md:flex">
              <span className="h-3 w-[2px] bg-neon-blue rounded animate-[bounce_0.8s_infinite]" />
              <span className="h-5 w-[2px] bg-neon-purple rounded animate-[bounce_1.2s_infinite]" />
              <span className="h-2 w-[2px] bg-neon-cyan rounded animate-[bounce_0.6s_infinite]" />
              <span className="h-4 w-[2px] bg-neon-blue rounded animate-[bounce_1.0s_infinite]" />
              <span className="h-1.5 w-[2px] bg-neon-purple rounded animate-[bounce_0.4s_infinite]" />
            </div>
            
            <div className="flex items-center space-x-2 rounded-lg border border-cyber-border/30 bg-black/50 px-3 py-1.5 font-mono text-[9px] text-gray-400">
              <Cpu className="h-3 w-3 text-neon-cyan animate-pulse" />
              <span>AI CONSOLE ACTIVE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
