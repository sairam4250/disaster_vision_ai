"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Eye, 
  LayoutDashboard, 
  Cpu, 
  BarChart3, 
  AlertOctagon, 
  ShieldAlert, 
  HelpCircle, 
  Menu, 
  X,
  Activity
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home & Search", href: "/", icon: Eye },
    { name: "Live Alerts & Map", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Disaster Simulator", href: "/prediction", icon: Cpu },
    { name: "Climate Trends", href: "/analytics", icon: BarChart3 },
    { name: "Emergency SOS Help", href: "/emergency", icon: ShieldAlert },
    { name: "Control Center", href: "/admin", icon: AlertOctagon },
    { name: "How it Works", href: "/about", icon: HelpCircle },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 rounded-lg border border-cyber-border/45 bg-dark-bg/80 p-2 text-neon-blue shadow-glow-blue md:hidden focus:outline-none"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar Wrapper */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-cyber-border/20 glass-panel transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-20 items-center justify-between border-b border-cyber-border/20 px-6">
          <Link href="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-neon-blue/40 bg-neon-blue/10 text-neon-blue shadow-glow-blue">
              <Eye className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-sm font-black tracking-wide text-white">
                DisasterVision <span className="text-neon-cyan font-mono text-[9px]">AI</span>
              </span>
              <span className="text-[10px] text-gray-400 font-sans">
                India Safety Portal
              </span>
            </div>
          </Link>
        </div>

        {/* System Monitoring Status */}
        <div className="px-6 py-4">
          <div className="rounded-lg border border-cyber-border/30 bg-black/40 p-3 font-mono text-[9px] text-gray-400">
            <div className="flex items-center justify-between">
              <span>STATUS:</span>
              <span className="flex items-center text-green-400 font-bold">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>CORE LOAD:</span>
              <span className="text-neon-blue font-semibold">12.4%</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>THREAT DB:</span>
              <span className="text-neon-purple font-semibold">V2.42</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center space-x-3 rounded-lg px-4 py-3 font-mono text-xs tracking-wider transition-all duration-300 ${
                  isActive
                    ? "border border-neon-blue/40 bg-neon-blue/10 text-neon-cyan shadow-glow-blue"
                    : "text-gray-400 hover:border hover:border-cyber-border/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? "text-neon-cyan" : "text-gray-400 group-hover:text-neon-blue"
                }`} />
                <span className="flex-1">{item.name}</span>
                {item.href === "/emergency" && (
                  <span className="rounded bg-neon-red px-1.5 py-0.5 font-sans text-[8px] font-extrabold text-white animate-pulse">
                    SOS
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="border-t border-cyber-border/20 p-6 font-mono text-[9px] text-gray-500">
          <div className="flex items-center space-x-2">
            <Activity className="h-3.5 w-3.5 text-neon-purple animate-pulse" />
            <span>METEOROLOGICAL SYS NODE-9</span>
          </div>
          <div className="mt-2 text-[8px]">
            &copy; 2026 DISASTERVISION AI.<br />
            ALL RIGHTS SECURITY RES.
          </div>
        </div>
      </aside>

      {/* Background overlay for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}
