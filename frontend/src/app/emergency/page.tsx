"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWeather } from "@/components/WeatherContext";
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Send, 
  AlertTriangle, 
  Map, 
  Info,
  Clock,
  Sparkles,
  Bot
} from "lucide-react";
import confetti from "canvas-confetti";

interface Shelter {
  name: string;
  distance_km: number;
  lat: number;
  lng: number;
  capacity_status: string;
}

interface Contact {
  department: string;
  hotline: string;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function EmergencyPage() {
  const { setParticleMode } = useWeather();
  
  // Beacon States
  const [beaconActive, setBeaconActive] = useState(false);
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [disasterType, setDisasterType] = useState("Flood");
  const [beaconData, setBeaconData] = useState<{ id: number; message: string; shelters: Shelter[]; contacts: Contact[] } | null>(null);

  // Chatbot States
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    { sender: "ai", text: "Disaster Preparedness Agent online. Ask me for survival guides, storm safety checklists, or how to prepare for severe weather." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // simulated notification dispatch logs
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  const activateSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !phone) return;

    setBeaconActive(true);
    setParticleMode("lightning"); 

    confetti({
      particleCount: 100,
      spread: 90,
      colors: ["#FF4D4D", "#000000", "#7B2FF7"]
    });

    const mockLat = 20.5937 + (Math.random() * 2.0 - 1.0);
    const mockLng = 78.9629 + (Math.random() * 2.0 - 1.0);

    try {
      const res = await fetch("http://localhost:8000/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: mockLat,
          lng: mockLng,
          user_name: userName,
          phone: phone,
          emergency_type: disasterType
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBeaconData({
          id: data.beacon_id,
          message: data.message,
          shelters: data.nearby_shelters,
          contacts: data.emergency_contacts
        });
        
        setDispatchLogs([
          `[${new Date().toLocaleTimeString()}] BEACON TRANSMITTING - ID: ${data.beacon_id}`,
          `[${new Date().toLocaleTimeString()}] Coordinates locked: ${mockLat.toFixed(4)}°N, ${mockLng.toFixed(4)}°E`,
          `[${new Date().toLocaleTimeString()}] National Rescue Center alerted. Dispatching relief base.`,
          `[${new Date().toLocaleTimeString()}] Safety SMS broadcasted to local networks.`
        ]);
      } else {
        throw new Error("SOS failed");
      }
    } catch (err) {
      console.warn("Backend API offline. Creating local simulation rescue beacon.", err);
      setBeaconData({
        id: Math.floor(Math.random() * 80000) + 10000,
        message: "Simulation Rescue Beacon Active. Broadcasted emergency parameters to regional coordinates.",
        shelters: [
          { name: "National Relief Camp - Primary Base", distance_km: 1.8, lat: mockLat + 0.008, lng: mockLng - 0.005, capacity_status: "65% Occupied" },
          { name: "Civil Government High School Shelter", distance_km: 3.4, lat: mockLat - 0.012, lng: mockLng + 0.015, capacity_status: "80% Occupied" },
        ],
        contacts: [
          { department: "National Disaster Response Force (NDRF)", hotline: "1078" },
          { department: "Red Cross Disaster Relief Unit", hotline: "1800-RED-CROSS" }
        ]
      });

      setDispatchLogs([
        `[${new Date().toLocaleTimeString()}] LOCAL EMERGENCY SIMULATOR RUNNING`,
        `[${new Date().toLocaleTimeString()}] Beacon coordinates locked: ${mockLat.toFixed(4)}°N, ${mockLng.toFixed(4)}°E`,
        `[${new Date().toLocaleTimeString()}] Simulated evacuation zones calculated.`
      ]);
    }
  };

  const deactivateSOS = () => {
    setBeaconActive(false);
    setBeaconData(null);
    setUserName("");
    setPhone("");
    setDispatchLogs([]);
    setParticleMode("none");
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setChatLog((prev) => [...prev, { sender: "user", text: queryText }]);
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryText })
      });

      if (res.ok) {
        const data = await res.json();
        setChatLog((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        throw new Error("Chat api failed");
      }
    } catch (err) {
      console.warn("Backend API offline. Fetching local preparedness guide.", err);
      
      let reply = "I am operating in offline emergency standby. For evacuation routing, select your hazard type: flood, earthquake, cyclone, or wildfire.";
      const msgLower = queryText.toLowerCase();

      if (msgLower.includes("flood")) {
        reply = "🌊 **Flood Evacuation Protocol:**\n- Move to higher ground or upper floors immediately. Avoid basements.\n- Do not attempt to walk, swim, or drive through flowing water.\n- Disconnect power supply and keep dry foods ready.";
      } else if (msgLower.includes("earthquake")) {
        reply = "🫨 **Earthquake Safety Protocol:**\n- Drop, Cover, and Hold on under heavy tables or desks.\n- Stay away from windows, ceiling fans, or tall furniture.\n- If outdoors, run to open ground away from poles and buildings.";
      } else if (msgLower.includes("cyclone")) {
        reply = "🌀 **Cyclone Storm Protocol:**\n- Stay inside and close all window shutters.\n- Keep your phone and torches charged. Keep batteries ready.\n- Disconnect heavy appliances and listen to local weather warnings.";
      } else if (msgLower.includes("wildfire") || msgLower.includes("fire")) {
        reply = "🔥 **Forest Fire Protocol:**\n- Evacuate immediately if fire is in your direction. Do not wait.\n- Cover your nose and mouth with a damp cloth to filter smoke.\n- Block air vents and door gaps in your house with wet towels.";
      } else if (msgLower.includes("kit") || msgLower.includes("supplies") || msgLower.includes("survival")) {
        reply = "🎒 **Survival Kit Essentials:**\n- Drinking water (3 liters per person per day)\n- Dry foods (biscuits, energy bars, roasted grains)\n- First aid box (bandages, antiseptics, essential pills)\n- Torches, extra batteries, and cash.";
      }

      setChatLog((prev) => [...prev, { sender: "ai", text: reply }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendQuery(chatInput);
    setChatInput("");
  };

  const quickChips = [
    { label: "🌊 Flood Guide", query: "What should I do in a flood?" },
    { label: "🫨 Earthquake Guide", query: "What should I do in an earthquake?" },
    { label: "🌀 Cyclone Guide", query: "What should I do in a cyclone?" },
    { label: "🎒 Survival Kit List", query: "What goes in a survival kit?" }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
          Emergency SOS <span className="bg-gradient-to-r from-neon-red to-neon-purple bg-clip-text text-transparent font-mono">& SUPPORT</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Activate emergency beacon, consult our rescue AI helper, and locate nearby safe shelter camps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Card: One-Click SOS Activator */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-3">
            <ShieldAlert className="h-5 w-5 text-neon-red animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Emergency Broadcast Beacon
            </span>
          </div>

          {!beaconActive ? (
            <form onSubmit={activateSOS} className="space-y-4 text-xs">
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3.5 text-neon-red flex items-start space-x-2.5">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 animate-pulse" />
                <span className="leading-relaxed font-semibold">
                  Note: Activating the beacon simulates broadcasting your current location to local rescue response centers. Use for disaster emergency simulation.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold block">YOUR NAME:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-cyber-border/40 bg-black/40 p-3 text-sm text-white focus:border-neon-blue focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold block">MOBILE NUMBER:</label>
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-cyber-border/40 bg-black/40 p-3 text-sm text-white focus:border-neon-blue focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold block">HAZARD EVENT TYPE:</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full rounded-xl border border-cyber-border/40 bg-black/40 p-3 text-sm text-white focus:border-neon-blue focus:outline-none"
                >
                  <option value="Flood">🌊 Flood / Inundation</option>
                  <option value="Earthquake">🫨 Earthquake / Seismic</option>
                  <option value="Cyclone">🌀 Cyclone / Typhoon</option>
                  <option value="Wildfire">🔥 Wildfire / Heatwave</option>
                  <option value="Landslide">🏔️ Landslide / Debris Flow</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-neon-red py-4 text-xs font-black tracking-widest text-white shadow-glow-red hover:opacity-90 active:scale-[0.98] duration-200"
              >
                ENGAGE EMERGENCY BEACON
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              
              {/* Pulsing Beacon Light */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-950/20 border border-neon-red/30">
                <div className="absolute h-16 w-16 rounded-full bg-neon-red/35 animate-ping" />
                <div className="h-10 w-10 rounded-full bg-neon-red shadow-glow-red active-pulse" />
              </div>

              <div className="space-y-1">
                <div className="text-neon-red text-xs font-black uppercase tracking-wider animate-pulse">
                  SOS TRANSMISSION IN PROGRESS
                </div>
                {beaconData && (
                  <div className="text-[10px] text-gray-400 font-mono">
                    BEACON LOG ID: #{beaconData.id}
                  </div>
                )}
              </div>

              {/* Live logs */}
              <div className="rounded-xl border border-neon-red/30 bg-black/50 p-3.5 text-left text-[9px] text-gray-300 font-mono space-y-1.5 max-h-[140px] overflow-y-auto">
                {dispatchLogs.map((log, index) => (
                  <div key={index} className={index === dispatchLogs.length - 1 ? "text-neon-cyan font-bold" : ""}>
                    {log}
                  </div>
                ))}
              </div>

              <button
                onClick={deactivateSOS}
                className="w-full rounded-xl border border-cyber-border/40 bg-white/5 py-3 text-xs text-gray-300 hover:text-white hover:border-white transition-colors duration-200"
              >
                CEASE TRANSMISSION
              </button>
            </div>
          )}
        </div>

        {/* Center Card: Rescue AI Helper (ChatGPT/Claude styled chat interface) */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 flex flex-col justify-between h-[510px]">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-3 mb-3">
            <Bot className="h-5 w-5 text-neon-blue" />
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>Rescue AI Assistant</span>
              <span className="rounded-full bg-neon-purple/20 px-2 py-0.5 text-[8px] text-neon-purple font-extrabold">STANDBY</span>
            </span>
          </div>

          {/* Chat message thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-3 text-xs leading-relaxed">
            {chatLog.map((chat, idx) => (
              <div
                key={idx}
                className={`flex flex-col rounded-xl p-3.5 max-w-[85%] ${
                  chat.sender === "user"
                    ? "ml-auto border border-neon-blue/30 bg-neon-blue/5 text-neon-cyan"
                    : "mr-auto border border-cyber-border/20 bg-white/5 text-gray-200"
                }`}
              >
                <span className="text-[8px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                  {chat.sender === "user" ? "You" : "Rescue Helper"}
                </span>
                <div className="whitespace-pre-line text-left leading-normal">{chat.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="mr-auto text-gray-500 animate-pulse text-[10px] font-mono">
                Rescue AI is formulating survival response...
              </div>
            )}
          </div>

          {/* Quick Helper Chips */}
          <div className="flex flex-wrap gap-1.5 pb-3">
            {quickChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => sendQuery(chip.query)}
                className="rounded-full border border-cyber-border/40 bg-white/5 hover:bg-neon-cyan/10 hover:border-neon-cyan/50 px-2.5 py-1 text-[10px] text-gray-300 font-semibold cursor-pointer transition-all duration-200"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat input box */}
          <form onSubmit={handleSendChat} className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask for storm advice, safety kit list..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded-xl border border-cyber-border/40 bg-black/40 p-3 text-xs text-white focus:border-neon-blue focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-neon-blue px-4.5 text-white shadow-glow-blue hover:opacity-90 active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Card: Safe shelters & rescue contacts */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-3">
            <Map className="h-5 w-5 text-neon-cyan" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Safe Shelter Camps & Hotlines
            </span>
          </div>

          {beaconData ? (
            <div className="space-y-5 text-xs">
              
              {/* Shelters list */}
              <div className="space-y-2">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">NEAREST RELIEF CAMPS:</span>
                <div className="space-y-2">
                  {beaconData.shelters.map((shelter, index) => (
                    <div key={index} className="rounded-xl border border-cyber-border/20 bg-white/5 p-3 flex flex-col gap-1.5">
                      <div className="flex justify-between text-white font-bold text-xs">
                        <span>{shelter.name}</span>
                        <span className="text-neon-cyan font-mono">{shelter.distance_km} km away</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-[10px]">
                        <span>MAPPED EVACUATION ZONE</span>
                        <span className="text-yellow-500 font-semibold">{shelter.capacity_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Helpline numbers */}
              <div className="space-y-2.5 border-t border-cyber-border/20 pt-4.5">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">DIRECT HELPLINE NUMBERS:</span>
                <div className="space-y-2">
                  {beaconData.contacts.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center rounded-xl bg-black/40 p-3">
                      <span className="text-gray-300 font-medium">{contact.department}</span>
                      <a href={`tel:${contact.hotline}`} className="rounded-lg bg-neon-red/10 border border-neon-red/35 hover:bg-neon-red/20 px-3 py-1.5 text-neon-red font-bold flex items-center space-x-1 transition-all">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        <span>{contact.hotline}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <MapPin className="h-8 w-8 text-cyber-border/50 animate-pulse" />
              <div className="text-xs text-gray-500 uppercase tracking-wide leading-relaxed">
                Activate the Emergency Beacon on the left to see nearby active shelters and contact hotlines.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
