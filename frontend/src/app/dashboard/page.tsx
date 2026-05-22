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

const regionToPrimaryStateMap: Record<string, string> = {
  "Himalayan Landslide Belt (Uttarakhand)": "Uttarakhand",
  "Brahmaputra Basin (Assam)": "Assam",
  "Bay of Bengal (Odisha Coast)": "Odisha",
  "Kachchh Seismic Fault (Bhuj, Gujarat)": "Gujarat",
  "Western Ghats Forest Zone (Maharashtra)": "Maharashtra"
};

export default function DashboardPage() {
  const { setParticleMode } = useWeather();
  
  const [selectedRegion, setSelectedRegion] = useState("Bay of Bengal (Odisha Coast)");
  const [selectedState, setSelectedState] = useState("Odisha");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<AlertFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<"citizen" | "expert">("citizen");

  // Handle outside click for search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with search queries from Homepage router redirection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlState = params.get("state");
      if (urlState) {
        const matchedState = indianStatesAndUTs.find(
          (s) => s.toLowerCase() === urlState.toLowerCase()
        );
        if (matchedState) {
          handleSelectState(matchedState);
        }
      }
    }
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
        console.warn("Backend API offline. Ingesting local simulation datasets.", err);
        
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
        console.warn("Backend API offline. Fetching mock safety alerts.", err);
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

  const handleMapSelectRegion = (regionName: string) => {
    setSelectedRegion(regionName);
    const mappedState = regionToPrimaryStateMap[regionName] || "Odisha";
    setSelectedState(mappedState);
    setSearchQuery("");
  };

  const handleSelectState = (state: string) => {
    setSelectedState(state);
    const matchedRegion = stateToRegionMap[state.toLowerCase()] || "Bay of Bengal (Odisha Coast)";
    setSelectedRegion(matchedRegion);
    setSearchQuery(state);
    setShowSuggestions(false);
  };

  const filteredStates = searchQuery
    ? indianStatesAndUTs.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : indianStatesAndUTs;

  const getCitizenStatus = (w: WeatherData) => {
    if (w.wind_speed > 100) {
      return {
        label: "Cyclone Danger (High Risk) 🚨",
        severity: "Danger",
        iconColor: "text-neon-red",
        bgColor: "border-neon-red/40 bg-red-950/20 shadow-glow-red",
        badge: "bg-neon-red/20 border-neon-red text-neon-red",
        simpleDesc: "Gale winds exceeding 200 km/h detected. Coastal areas are at risk of storm surges.",
        steps: [
          "Move to strong concrete buildings or government shelter camps immediately.",
          "Keep away from windows, glass sheets, loose trees, or power cables.",
          "Charge your mobile phones, lanterns, and power banks right now.",
          "Keep drinking water, essential medicines, and dry foods packed."
        ]
      };
    }
    if (w.rainfall > 150) {
      return {
        label: "Severe Flooding Alert 🚨",
        severity: "Danger",
        iconColor: "text-neon-red",
        bgColor: "border-neon-red/40 bg-red-950/20 shadow-glow-red",
        badge: "bg-neon-red/20 border-neon-red text-neon-red",
        simpleDesc: "Extremely heavy rainfall causing local rivers and storm channels to overflow.",
        steps: [
          "Do not walk or drive through flooded waters. Just 6 inches of water can sweep you away.",
          "Move valuable belongings and family members to upper floors or high ground.",
          "Switch off your home's main electricity switch if water enters the building.",
          "Keep emergency emergency numbers saved on paper in case network drops."
        ]
      };
    }
    if (w.temperature > 40 && w.humidity < 20) {
      return {
        label: "Extreme Heat & Forest Fire Warning ⚠️",
        severity: "Warning",
        iconColor: "text-orange-400",
        bgColor: "border-orange-400/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        badge: "bg-orange-500/20 border-orange-500 text-orange-400",
        simpleDesc: "Very high temperatures and dry air. High risk of dehydration and wild grass fires.",
        steps: [
          "Avoid direct sun exposure, especially between 11:00 AM and 4:00 PM.",
          "Drink plenty of water and ORS, even if you do not feel thirsty.",
          "Keep pets in the shade and ensure they have cool drinking water.",
          "Do not burn garbage or dry leaves near forests or dry bushes."
        ]
      };
    }
    if (w.rainfall > 80 && w.region.includes("Uttarakhand")) {
      return {
        label: "Mountain Landslide Warning ⚠️",
        severity: "Warning",
        iconColor: "text-yellow-500",
        bgColor: "border-yellow-500/45 bg-yellow-950/25 shadow-[0_0_15px_rgba(234,179,8,0.15)]",
        badge: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
        simpleDesc: "Heavy rains have made hill slopes loose. Rockfalls may occur along highways.",
        steps: [
          "Avoid traveling on mountain roads during rainfall. Postpone hill trips.",
          "Watch out for sudden water surges in small streams or falling pebbles on slopes.",
          "Stay clear of steep slopes or muddy hill faces.",
          "Listen to local traffic police and disaster safety checkposts."
        ]
      };
    }
    if (w.seismic_activity > 5.0) {
      return {
        label: "Earthquake Tremor Caution ⚠️",
        severity: "Warning",
        iconColor: "text-yellow-500",
        bgColor: "border-yellow-500/45 bg-yellow-950/25 shadow-[0_0_15px_rgba(234,179,8,0.15)]",
        badge: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
        simpleDesc: "Active underground tremors detected. Expect mild aftershocks.",
        steps: [
          "If shaking starts, Drop, Cover, and Hold on under a strong wooden table.",
          "If outdoors, move to open fields away from buildings, poles, and flyovers.",
          "Do not use elevators during tremors or immediately after.",
          "Keep a flashlight and shoes near your bed in case of night evacuations."
        ]
      };
    }
    return {
      label: "Safe & Calm Conditions ✅",
      severity: "Safe",
      iconColor: "text-green-400",
      bgColor: "border-green-500/25 bg-green-950/10 shadow-[0_0_15px_rgba(34,197,94,0.05)]",
      badge: "bg-green-500/20 border-green-500 text-green-400",
      simpleDesc: "No natural disasters or dangerous weather systems detected in this region.",
      steps: [
        "Local weather indicators are normal and safe.",
        "Daily outdoor work and travel can proceed as planned.",
        "Always check local alerts before traveling across states.",
        "Emergency systems are scanning in the background."
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
    <div className="space-y-6 font-sans">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/20 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs tracking-wider text-neon-blue font-bold uppercase">
            <Sparkles className="h-4 w-4 text-neon-cyan animate-pulse" />
            <span>National Meteorological Advisory Grid</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            Live Safety Alerts <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent font-mono">& MAP</span>
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 rounded-xl border border-cyber-border/40 bg-black/60 p-1 font-sans text-xs font-bold">
          <button
            onClick={() => setViewMode("citizen")}
            className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 transition-all duration-300 ${
              viewMode === "citizen"
                ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow-blue"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>👤 CITIZEN VIEW</span>
          </button>
          <button
            onClick={() => setViewMode("expert")}
            className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 transition-all duration-300 ${
              viewMode === "expert"
                ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow-blue"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>🔬 EXPERT CONSOLE</span>
          </button>
        </div>
      </div>

      {/* State Autocomplete Search Bar & Location Badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Search input container */}
        <div ref={searchContainerRef} className="relative md:col-span-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4.5 h-4.5 w-4.5 text-neon-blue animate-pulse" />
            <input
              type="text"
              placeholder="Search by state or union territory (e.g. Uttarakhand, Bihar, Assam...)"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full rounded-2xl border border-cyber-border/40 bg-dark-bg/85 py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 shadow-glow-blue outline-none transition-all duration-300 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto rounded-xl border border-cyber-border/60 bg-dark-bg/95 p-2 backdrop-blur-xl shadow-2xl">
              {filteredStates.length > 0 ? (
                filteredStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => handleSelectState(state)}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-xs text-gray-300 hover:bg-neon-blue/15 hover:text-white transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-neon-cyan" />
                      <span>{state}</span>
                    </div>
                    <span className="font-mono text-[9px] text-gray-500 uppercase">
                      Region: {stateToRegionMap[state.toLowerCase()]?.split(" (")[0] || "General Zone"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-3 text-center text-xs text-gray-500">
                  No matching state found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Region Status Indicator */}
        <div className="rounded-2xl border border-cyber-border/30 bg-black/40 px-4 py-2.5 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/10 text-neon-cyan border border-neon-cyan/20">
            <MapPin className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <div className="text-[9px] font-sans text-gray-400 uppercase tracking-wider font-bold">Selected Location</div>
            <div className="text-sm font-bold text-white leading-tight">
              {selectedState} <span className="text-[10px] text-neon-purple font-normal block">{selectedRegion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content Area */}
      {viewMode === "citizen" ? (
        
        /* CITIZEN MODE: EASY, USER-FRIENDLY & ACTIONABLE */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Main Left: India Interactive Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <InteractiveMap onSelectRegion={handleMapSelectRegion} activeRegion={selectedRegion} />
              <div className="absolute top-16 left-4 pointer-events-none bg-black/60 border border-cyber-border/20 px-3 py-1.5 rounded-lg text-[10px] text-gray-300">
                👉 <span className="text-neon-cyan font-semibold">Click nodes on the map</span> to change regions manually.
              </div>
            </div>
            
            {/* Simple Alert Feed */}
            <div className="rounded-2xl border border-cyber-border/30 bg-dark-bg/60 p-5">
              <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-3 mb-4">
                <Volume2 className="h-4.5 w-4.5 text-neon-red animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Important Public Safety Alerts Across India
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-xl border p-4 transition-all ${getSeverityAlertBg(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 rounded-lg bg-black/40 p-2">
                        <AlertTriangle className="h-4.5 w-4.5 text-orange-400" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white uppercase tracking-wide">
                          {alert.type} Warning — {alert.region}
                        </div>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Safety Status Hub */}
          <div className="space-y-6">
            
            {/* The Citizen Safety Hub Card (Simplified description) */}
            {citizenStatus && (
              <div className={`rounded-2xl border p-5 ${citizenStatus.bgColor} transition-all duration-300`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <Shield className={`h-5 w-5 ${citizenStatus.iconColor}`} />
                    <span>Citizen Safety Hub</span>
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold border ${citizenStatus.badge}`}>
                    {citizenStatus.severity}
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider block uppercase">CURRENT RISK STATUS</span>
                    <h4 className="text-lg font-black text-white mt-1">
                      {citizenStatus.label}
                    </h4>
                    <p className="text-xs text-gray-200 mt-2.5 leading-relaxed">
                      {citizenStatus.simpleDesc}
                    </p>
                  </div>

                  {/* Safety Actions Checklist */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <span className="text-[10px] font-bold text-neon-cyan tracking-wider block uppercase">WHAT YOU SHOULD DO RIGHT NOW:</span>
                    <ul className="space-y-3 text-xs">
                      {citizenStatus.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-gray-200">
                          <CheckCircle2 className="h-4.5 w-4.5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Helpline SOS Call */}
                  <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                    <Link
                      href="/emergency"
                      className="flex items-center justify-center space-x-2 rounded-xl bg-neon-red/25 border border-neon-red/50 hover:bg-neon-red/35 px-4 py-3.5 text-xs font-bold text-neon-red tracking-wider shadow-glow-red transition-all duration-200 active:scale-95"
                    >
                      <PhoneCall className="h-4.5 w-4.5 animate-pulse" />
                      <span>ACTIVATE SOS EMERGENCY ASSISTANT</span>
                    </Link>
                    
                    <Link
                      href="/prediction"
                      className="flex items-center justify-center space-x-1.5 hover:underline px-4 py-2 text-xs font-semibold text-neon-blue"
                    >
                      <span>Simulate Custom Disasters</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                </div>
              </div>
            )}

            {/* Simple Local Weather Overview */}
            <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-cyber-border/20 pb-2.5 mb-4">
                Current Local Weather
              </h3>
              {weather ? (
                <div className="space-y-4.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-cyber-border/10 bg-white/5 p-3 flex items-center space-x-2.5">
                      <Thermometer className="h-6 w-6 text-neon-red" />
                      <div>
                        <div className="text-[10px] text-gray-400">Temperature</div>
                        <div className="text-sm font-bold text-white">{weather.temperature}°C</div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-cyber-border/10 bg-white/5 p-3 flex items-center space-x-2.5">
                      <CloudRain className="h-6 w-6 text-blue-400" />
                      <div>
                        <div className="text-[10px] text-gray-400">Rainfall</div>
                        <div className="text-sm font-bold text-white">{weather.rainfall} mm</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-cyber-border/10 bg-white/5 p-3.5 flex items-center space-x-3">
                    <Wind className="h-6 w-6 text-neon-cyan" />
                    <div className="flex-1">
                      <div className="text-[10px] text-gray-400">Wind Status</div>
                      <div className="text-xs font-bold text-white">{weather.wind_speed} km/h (Normal winds)</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-xs text-gray-500 animate-pulse">
                  Loading weather metrics...
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
