"use client";

import React, { useState, useEffect, useRef } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import RadarScanner from "@/components/RadarScanner";
import { useWeather } from "@/components/WeatherContext";
import Link from "next/link";
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  Activity,
  AlertTriangle,
  Radio,
  Search,
  Shield,
  CheckCircle2,
  Info,
  Sparkles,
  Layers,
  ArrowRight,
  MapPin,
  ChevronRight,
  PhoneCall,
  Volume2
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

// Indian States and UTs
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

// Mapping from State -> Meteorological Regional Station
const stateToRegionMap: Record<string, string> = {
  "uttarakhand": "Himalayan Landslide Belt (Uttarakhand)",
  "himachal pradesh": "Himalayan Landslide Belt (Uttarakhand)",
  "jammu & kashmir": "Himalayan Landslide Belt (Uttarakhand)",
  "jammu and kashmir": "Himalayan Landslide Belt (Uttarakhand)",
  "ladakh": "Himalayan Landslide Belt (Uttarakhand)",
  
  "assam": "Brahmaputra Basin (Assam)",
  "arunachal pradesh": "Brahmaputra Basin (Assam)",
  "manipur": "Brahmaputra Basin (Assam)",
  "meghalaya": "Brahmaputra Basin (Assam)",
  "mizoram": "Brahmaputra Basin (Assam)",
  "nagaland": "Brahmaputra Basin (Assam)",
  "sikkim": "Brahmaputra Basin (Assam)",
  "tripura": "Brahmaputra Basin (Assam)",
  "bihar": "Brahmaputra Basin (Assam)",
  "uttar pradesh": "Brahmaputra Basin (Assam)",

  "odisha": "Bay of Bengal (Odisha Coast)",
  "orissa": "Bay of Bengal (Odisha Coast)",
  "west bengal": "Bay of Bengal (Odisha Coast)",
  "andhra pradesh": "Bay of Bengal (Odisha Coast)",
  "tamil nadu": "Bay of Bengal (Odisha Coast)",
  "puducherry": "Bay of Bengal (Odisha Coast)",
  "pondicherry": "Bay of Bengal (Odisha Coast)",
  "andaman and nicobar islands": "Bay of Bengal (Odisha Coast)",
  "andaman": "Bay of Bengal (Odisha Coast)",

  "gujarat": "Kachchh Seismic Fault (Bhuj, Gujarat)",
  "rajasthan": "Kachchh Seismic Fault (Bhuj, Gujarat)",
  "punjab": "Kachchh Seismic Fault (Bhuj, Gujarat)",
  "haryana": "Kachchh Seismic Fault (Bhuj, Gujarat)",
  "delhi": "Kachchh Seismic Fault (Bhuj, Gujarat)",

  "maharashtra": "Western Ghats Forest Zone (Maharashtra)",
  "goa": "Western Ghats Forest Zone (Maharashtra)",
  "karnataka": "Western Ghats Forest Zone (Maharashtra)",
  "kerala": "Western Ghats Forest Zone (Maharashtra)",
  "telangana": "Western Ghats Forest Zone (Maharashtra)",
  "madhya pradesh": "Western Ghats Forest Zone (Maharashtra)",
  "chhattisgarh": "Western Ghats Forest Zone (Maharashtra)",
  "jharkhand": "Western Ghats Forest Zone (Maharashtra)",
  "lakshadweep": "Western Ghats Forest Zone (Maharashtra)",
  "dadra and nagar haveli and daman and diu": "Kachchh Seismic Fault (Bhuj, Gujarat)"
};

// Mapping from Meteorological Regional Station -> Primary State
const regionToPrimaryStateMap: Record<string, string> = {
  "Himalayan Landslide Belt (Uttarakhand)": "Uttarakhand",
  "Brahmaputra Basin (Assam)": "Assam",
  "Bay of Bengal (Odisha Coast)": "Odisha",
  "Kachchh Seismic Fault (Bhuj, Gujarat)": "Gujarat",
  "Western Ghats Forest Zone (Maharashtra)": "Maharashtra"
};

export default function DashboardPage() {
  const { setParticleMode } = useWeather();
  
  // States
  const [selectedRegion, setSelectedRegion] = useState("Bay of Bengal (Odisha Coast)");
  const [selectedState, setSelectedState] = useState("Odisha");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<AlertFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // View Mode: 'citizen' (simple) vs 'expert' (scientific)
  const [viewMode, setViewMode] = useState<"citizen" | "expert">("citizen");

  // Handle outside click for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        if (selectedRegion.includes("Western Ghats") || selectedRegion.includes("Maharashtra")) {
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
        const mockAlerts: AlertFeedItem[] = [
          { id: 1, type: "Cyclone", severity: "Critical", region: "Odisha Coast / Bay of Bengal", message: "Cyclone 'Amphan II' forming. Sustained wind speeds exceeding 210 km/h. Evacuate low-lying areas.", timestamp: new Date().toISOString(), active: 1 },
          { id: 2, type: "Wildfire", severity: "High", region: "Western Ghats, Maharashtra", message: "Forest fire spreading rapidly due to 43°C heat and dried forest cover. Containment at 5%.", timestamp: new Date().toISOString(), active: 1 },
          { id: 3, type: "Flood", severity: "High", region: "Brahmaputra Basin, Assam", message: "River levels breached critical thresholds. Heavy monsoon rainfall (420mm) forecasted for next 48 hrs.", timestamp: new Date().toISOString(), active: 1 },
        ];
        setAlerts(mockAlerts);
      }
    }
    fetchAlerts();
  }, []);

  // Handle map selection sync
  const handleMapSelectRegion = (regionName: string) => {
    setSelectedRegion(regionName);
    const mappedState = regionToPrimaryStateMap[regionName] || "Odisha";
    setSelectedState(mappedState);
    setSearchQuery("");
  };

  // State Search selection handler
  const handleSelectState = (state: string) => {
    setSelectedState(state);
    const matchedRegion = stateToRegionMap[state.toLowerCase()] || "Bay of Bengal (Odisha Coast)";
    setSelectedRegion(matchedRegion);
    setSearchQuery(state);
    setShowSuggestions(false);
  };

  // Filter states based on search query
  const filteredStates = searchQuery
    ? indianStatesAndUTs.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : indianStatesAndUTs;

  // Derive simple citizen instructions
  const getCitizenStatus = (w: WeatherData) => {
    if (w.wind_speed > 100) {
      return {
        label: "Cyclone Storm Threat (Critical)",
        severity: "Critical",
        iconColor: "text-neon-red",
        bgColor: "border-neon-red/40 bg-red-950/20 shadow-[0_0_15px_rgba(255,77,77,0.15)]",
        badge: "bg-neon-red/10 border-neon-red/50 text-neon-red",
        simpleDesc: "A severe cyclonic storm warning is active. Coastal gale winds can cause damage to structures.",
        steps: [
          "Evacuate coastal or low-lying houses to strong structures or shelter camps immediately.",
          "Stay indoors, close all windows, and keep away from loose trees or electrical posts.",
          "Ensure emergency devices (power banks, phones) are fully charged.",
          "Keep clean drinking water and non-perishable food stocked."
        ]
      };
    }
    if (w.rainfall > 150) {
      return {
        label: "Severe Flood Warning (High)",
        severity: "High",
        iconColor: "text-orange-500",
        bgColor: "border-orange-500/40 bg-orange-950/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
        badge: "bg-orange-500/10 border-orange-500/50 text-orange-400",
        simpleDesc: "Dangerous water levels. Heavy rain is causing local rivers and drains to overflow.",
        steps: [
          "Do not attempt to walk, swim, or drive through flooded roads or underpasses.",
          "Move valuable assets and family members to higher floors or high ground.",
          "Avoid contacting electric connections or sockets that might be wet.",
          "Watch out for open manholes and sewage flow directions."
        ]
      };
    }
    if (w.temperature > 40 && w.humidity < 20) {
      return {
        label: "Extreme Heat & Wildfire Advisory (High)",
        severity: "High",
        iconColor: "text-orange-400",
        bgColor: "border-orange-400/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        badge: "bg-amber-500/10 border-amber-500/50 text-amber-400",
        simpleDesc: "Extremely dry atmosphere. Wildfires are spreading on dry grass slopes. Avoid direct heat.",
        steps: [
          "Avoid direct sun exposure between 11:00 AM and 4:00 PM.",
          "Stay well-hydrated by drinking water or homemade ORS drinks.",
          "Avoid lit fires, disposal of matches, or trash burning in dry open vegetation areas.",
          "Keep livestock and pets in shaded spots with plenty of cool water."
        ]
      };
    }
    if (w.rainfall > 80 && w.region.includes("Uttarakhand")) {
      return {
        label: "Mountain Landslide Risk (Moderate)",
        severity: "Moderate",
        iconColor: "text-yellow-500",
        bgColor: "border-yellow-500/40 bg-yellow-950/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]",
        badge: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
        simpleDesc: "Soil is saturated on slopes. Rocks and soil blocks may tumble down hill sections.",
        steps: [
          "Postpone highway travel in mountainous segments until rainfall subsides.",
          "Watch for sudden mud flows, tree tilts, or trickling pebbles on cliffs.",
          "Stay clear of river channels where sudden blockages or flash floods can occur.",
          "Cooperate with local disaster management road block warnings."
        ]
      };
    }
    if (w.seismic_activity > 5.0) {
      return {
        label: "Earthquake Tremor Warning (Moderate)",
        severity: "Moderate",
        iconColor: "text-yellow-500",
        bgColor: "border-yellow-500/40 bg-yellow-950/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]",
        badge: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
        simpleDesc: "Moderate tremors recorded along seismic zones. Watch for vibrations.",
        steps: [
          "Practice 'Drop, Cover, and Hold On' underneath strong tables if you feel a shake.",
          "Run out of older concrete buildings to open areas away from overhead poles.",
          "Expect minor aftershocks. Stay calm and stay away from weak structures.",
          "Avoid elevator usage during or immediately after ground vibrations."
        ]
      };
    }
    return {
      label: "Safe & Calm Conditions",
      severity: "Low",
      iconColor: "text-green-400",
      bgColor: "border-green-500/20 bg-green-950/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]",
      badge: "bg-green-500/10 border-green-500/50 text-green-400",
      simpleDesc: "No active natural threat warnings. The weather parameters are regular.",
      steps: [
        "Conditions are safe for travel and outdoor work.",
        "Normal daily routines can be pursued without precautions.",
        "Stay hydrated during hot periods.",
        "System alerts are automated and update in real-time."
      ]
    };
  };

  const citizenStatus = weather ? getCitizenStatus(weather) : null;

  const getSeverityAlertBg = (sev: string) => {
    switch (sev) {
      case "Critical": return "border-neon-red/40 text-neon-red bg-red-950/30";
      case "High": return "border-orange-500/40 text-orange-400 bg-orange-950/30";
      default: return "border-yellow-500/40 text-yellow-400 bg-yellow-950/30";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Premium Dashboard Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/20 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] tracking-wider text-neon-blue font-mono uppercase">
            <Sparkles className="h-3.5 w-3.5 text-neon-cyan animate-pulse" />
            <span>Meteorological Information System</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            National Threat Control <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent font-mono">DASHBOARD</span>
          </h2>
        </div>

        {/* View mode toggle switch */}
        <div className="flex items-center space-x-1.5 rounded-xl border border-cyber-border/40 bg-black/60 p-1 font-mono text-[10px] font-bold">
          <button
            onClick={() => setViewMode("citizen")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-all duration-300 ${
              viewMode === "citizen"
                ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow-blue"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>👤 CITIZEN VIEW</span>
          </button>
          <button
            onClick={() => setViewMode("expert")}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 transition-all duration-300 ${
              viewMode === "expert"
                ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow-blue"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>🔬 EXPERT CONSOLE</span>
          </button>
        </div>
      </div>

      {/* Autocomplete Search Bar & Current Location Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Search input container */}
        <div ref={searchContainerRef} className="relative md:col-span-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-neon-blue animate-pulse" />
            <input
              type="text"
              placeholder="🔍 Search for your state or region (e.g. Uttarakhand, Odisha, Maharashtra...)"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full rounded-2xl border border-cyber-border/40 bg-dark-bg/85 py-3.5 pl-12 pr-4 font-sans text-sm text-white placeholder-gray-500 shadow-glow-blue outline-none transition-all duration-300 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredStates.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto rounded-xl border border-cyber-border/60 bg-dark-bg/95 p-2 backdrop-blur-xl shadow-2xl">
              {filteredStates.map((state) => (
                <button
                  key={state}
                  onClick={() => handleSelectState(state)}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left font-sans text-xs text-gray-300 hover:bg-neon-blue/15 hover:text-white transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-neon-cyan" />
                    <span>{state}</span>
                  </div>
                  <span className="font-mono text-[9px] text-gray-500 uppercase">
                    {stateToRegionMap[state.toLowerCase()]?.split(" (")[0] || "General Zone"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Region Status Indicator */}
        <div className="rounded-2xl border border-cyber-border/30 bg-black/40 px-4 py-2.5 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/10 text-neon-cyan border border-neon-cyan/20">
            <MapPin className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">MONITORED REGION</div>
            <div className="text-xs font-bold text-white leading-tight">
              {selectedState} <span className="text-[10px] font-mono text-neon-purple font-normal block">{selectedRegion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections based on viewMode */}
      {viewMode === "citizen" ? (
        
        /* CITIZEN MODE: EASY, USER-FRIENDLY & ACTIONABLE */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Main left block: Interactive SVG Map of India (Visual & clean) */}
          <div className="lg:col-span-2 space-y-6">
            <InteractiveMap onSelectRegion={handleMapSelectRegion} activeRegion={selectedRegion} />
            
            {/* Plain English Citizen Alert Feed */}
            <div className="rounded-2xl border border-cyber-border/30 bg-dark-bg/60 p-4">
              <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2 mb-3">
                <Volume2 className="h-4 w-4 text-neon-red animate-pulse" />
                <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                  Important Public Safety Alerts
                </span>
              </div>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${getSeverityAlertBg(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 rounded-lg bg-black/40 p-1.5">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white uppercase tracking-wider">
                          {alert.type} Warning - {alert.region}
                        </div>
                        <p className="text-xs text-gray-300 mt-1 font-sans leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar: Citizen Safety status hub */}
          <div className="space-y-6">
            
            {/* The Citizen Safety Hub Card (Simplified description) */}
            {citizenStatus && (
              <div className={`rounded-2xl border p-5 ${citizenStatus.bgColor} transition-all duration-300`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <h3 className="font-sans text-sm font-extrabold text-white flex items-center space-x-2">
                    <Shield className={`h-5 w-5 ${citizenStatus.iconColor}`} />
                    <span>Citizen Safety Hub</span>
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-[9px] font-extrabold border ${citizenStatus.badge}`}>
                    {citizenStatus.severity}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 tracking-wider block uppercase">CURRENT RISK STATUS</span>
                    <h4 className="text-lg font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                      <span>{citizenStatus.label}</span>
                    </h4>
                    <p className="text-xs text-gray-300 font-sans mt-2 leading-relaxed">
                      {citizenStatus.simpleDesc}
                    </p>
                  </div>

                  {/* Safety actions list */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <span className="text-[10px] font-mono text-neon-cyan tracking-wider block uppercase">RECOMMENDED CITIZEN ACTIONS:</span>
                    <ul className="space-y-2.5 font-sans text-xs">
                      {citizenStatus.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Help links / Quick buttons */}
                  <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                    <Link
                      href="/emergency"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-neon-red/20 border border-neon-red/40 hover:bg-neon-red/35 px-4 py-3 text-xs font-bold text-neon-red tracking-wider shadow-glow-red transition-all duration-200 active:scale-95"
                    >
                      <PhoneCall className="h-4 w-4 animate-pulse" />
                      <span>ACTIVATE SOS EMERGENCY ASSISTANT</span>
                    </Link>
                    <Link
                      href="/prediction"
                      className="flex items-center justify-center space-x-1.5 hover:underline px-4 py-2 text-xs font-semibold text-neon-blue"
                    >
                      <span>Simulate Custom Disasters</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                </div>
              </div>
            )}

            {/* Simple weather card for citizen */}
            <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-4">
              <h3 className="font-sans text-xs font-bold text-white uppercase tracking-wider border-b border-cyber-border/20 pb-2 mb-4">
                Current Local Weather
              </h3>
              {weather ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-cyber-border/10 bg-white/5 p-3 flex items-center space-x-2">
                      <Thermometer className="h-5 w-5 text-neon-red" />
                      <div>
                        <div className="text-[9px] text-gray-400">Temperature</div>
                        <div className="text-sm font-bold text-white">{weather.temperature}°C</div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-cyber-border/10 bg-white/5 p-3 flex items-center space-x-2">
                      <CloudRain className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-[9px] text-gray-400">Rainfall</div>
                        <div className="text-sm font-bold text-white">{weather.rainfall} mm</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-cyber-border/10 bg-white/5 p-3 flex items-center space-x-3">
                    <Wind className="h-5 w-5 text-neon-cyan" />
                    <div className="flex-1">
                      <div className="text-[9px] text-gray-400">Wind Status</div>
                      <div className="text-xs font-bold text-white">{weather.wind_speed} km/h (Normal winds)</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-xs text-gray-500 animate-pulse font-mono">
                  Loading weather...
                </div>
              )}
            </div>

          </div>

        </div>

      ) : (

        /* EXPERT MODE: ADVANCED METEOROLOGICAL TELEMETRY & SCIENTIFIC ANALYTICS */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Map & Live raw logs */}
          <div className="lg:col-span-2 space-y-6">
            <InteractiveMap onSelectRegion={handleMapSelectRegion} activeRegion={selectedRegion} />
            
            {/* Technical logs */}
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
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-2 rounded border p-2.5 transition-colors ${getSeverityAlertBg(alert.severity)}`}
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

          {/* Expert Telemetry sensor readings */}
          <div className="space-y-6">
            
            {/* Meteorological Sensors */}
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

            {/* Radar Sweep Component */}
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

      )}

    </div>
  );
}
