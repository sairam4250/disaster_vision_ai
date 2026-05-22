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
    { sender: "ai", text: "Disaster Preparedness Agent Online. State your environmental hazard type or ask for survival guidance." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Simulated Notification dispatch log
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
    setParticleMode("lightning"); // Turn background stormy on SOS trigger

    // Fire heavy red confetti alarm warning
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
        
        // Add dispatch alerts logs
        setDispatchLogs([
          `[${new Date().toLocaleTimeString()}] BEACON BROADCASTED - ID: ${data.beacon_id}`,
          `[${new Date().toLocaleTimeString()}] Coordinate Lock: ${mockLat.toFixed(4)}°N, ${mockLng.toFixed(4)}°E`,
          `[${new Date().toLocaleTimeString()}] Local Responders Notified. Dispatching NDRF relief unit.`,
          `[${new Date().toLocaleTimeString()}] SMS Notification broadcasted to regional security channels.`
        ]);
      } else {
        throw new Error("SOS API call failed");
      }
    } catch (err) {
      console.warn("Backend API not reachable. Creating offline emergency fallback response.", err);
      // Offline fallback
      setBeaconData({
        id: Math.floor(Math.random() * 80000) + 10000,
        message: "Offline Emergency Signal Active. Visual beacons engaged on local network interface.",
        shelters: [
          { name: "NDRF Emergency Shelter - Primary Base", distance_km: 1.8, lat: mockLat + 0.008, lng: mockLng - 0.005, capacity_status: "65% Occupied" },
          { name: "District Civil Relief Hospital & Shelter", distance_km: 3.4, lat: mockLat - 0.012, lng: mockLng + 0.015, capacity_status: "80% Occupied" },
        ],
        contacts: [
          { department: "National Disaster Response Force", hotline: "1078" },
          { department: "Red Cross Disaster Hotline", hotline: "1800-RED-CROSS" }
        ]
      });

      setDispatchLogs([
        `[${new Date().toLocaleTimeString()}] OFFLINE EMERGENCY SIMULATION READY`,
        `[${new Date().toLocaleTimeString()}] Visual beacons active. System broadcasting coordinates locally.`
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

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatLog((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      if (res.ok) {
        const data = await res.json();
        setChatLog((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        throw new Error("Chat api failed");
      }
    } catch (err) {
      console.warn("Backend API not reachable. Loading chat heuristic guidelines offline.", err);
      
      let reply = "I am operating in offline emergency standby. For evacuation routing, identify your primary anomaly: flood, earthquake, cyclone, or wildfire.";
      const msgLower = userMsg.toLowerCase();

      if (msgLower.includes("flood")) {
        reply = "🌊 **Flood Action Guideline:** Move to high elevation vertical structures instantly. Do not enter basement floors. Avoid traversing moving waters. Keep N95 filtration masks dry.";
      } else if (msgLower.includes("earthquake")) {
        reply = "🚨 **Earthquake Guideline:** Drop, Cover, and Hold. Seek cover underneath heavy desks/framing. Avoid glass spans. Do not exit structures until major rolling stops.";
      } else if (msgLower.includes("wildfire") || msgLower.includes("fire")) {
        reply = "🔥 **Wildfire Guideline:** Retreat away from brush corridors. Fill bathtubs and containers with water. Seal air gaps using damp towels. Cover airways using damp fiber cloth.";
      } else if (msgLower.includes("kit") || msgLower.includes("survival")) {
        reply = "🎒 **Survival Kit Essentials:** Multi-day water rations (3L/day), non-perishable food, UHF radio, flashlights, space blankets, and basic medical dressings.";
      }

      setChatLog((prev) => [...prev, { sender: "ai", text: reply }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
          SOS Emergency Command Console
        </h2>
        <p className="text-xs text-gray-400 font-mono">
          Activate emergency beacon matrix, chat with rescue AI, and locate survival coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: One-Click SOS Activator */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <ShieldAlert className="h-4 w-4 text-neon-red animate-pulse" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              SOS Broadcast Beacon
            </span>
          </div>

          {!beaconActive ? (
            <form onSubmit={activateSOS} className="space-y-4 font-mono text-[10px]">
              <div className="rounded border border-red-500/20 bg-red-950/10 p-3 text-neon-red flex items-start space-x-2.5">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
                <span className="leading-relaxed">
                  WARNING: Triggering the beacon broadcasts your simulated coordinates to active emergency rescue operations channels. Use for active anomaly events only.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">CITIZEN NAME:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Captain James Cook"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded border border-cyber-border/40 bg-black/40 p-2.5 text-xs text-white focus:border-neon-blue focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">DISPATCH PHONE NUMBER:</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 415-555-2671"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded border border-cyber-border/40 bg-black/40 p-2.5 text-xs text-white focus:border-neon-blue focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">DISASTER THREAT CLASS:</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full rounded border border-cyber-border/40 bg-black/40 p-2.5 text-xs text-white focus:border-neon-blue focus:outline-none"
                >
                  <option value="Flood">Flood / Inundation</option>
                  <option value="Earthquake">Earthquake / Seismic</option>
                  <option value="Cyclone">Cyclone / Typhoon</option>
                  <option value="Wildfire">Wildfire / Heatwave</option>
                  <option value="Landslide">Landslide / Debris Flow</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-neon-red py-4 text-xs font-black tracking-widest text-white shadow-glow-red hover:opacity-90 active:scale-[0.98]"
              >
                ENGAGE EMERGENCY BEACON
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center font-mono">
              {/* Pulsing Beacon Light */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-950/20 border border-neon-red/30">
                <div className="absolute h-16 w-16 rounded-full bg-neon-red/30 animate-ping" />
                <div className="h-10 w-10 rounded-full bg-neon-red shadow-glow-red active-pulse" />
              </div>

              <div className="space-y-1">
                <div className="text-neon-red text-xs font-black uppercase tracking-wider animate-pulse">
                  BEACON SIGNAL BROADCASTING
                </div>
                {beaconData && (
                  <div className="text-[9px] text-gray-400">
                    TRANSMISSION ID: {beaconData.id} // SECURE PASS LOCK
                  </div>
                )}
              </div>

              {/* Live dispatch logs box */}
              <div className="rounded border border-neon-red/30 bg-black/40 p-3 text-left text-[8px] text-gray-400 space-y-1.5 max-h-[120px] overflow-y-auto">
                {dispatchLogs.map((log, index) => (
                  <div key={index} className={index === dispatchLogs.length - 1 ? "text-neon-cyan font-bold" : ""}>
                    {log}
                  </div>
                ))}
              </div>

              <button
                onClick={deactivateSOS}
                className="w-full rounded-lg border border-cyber-border/40 bg-white/5 py-2.5 text-xs text-gray-300 hover:text-white hover:border-white transition-colors"
              >
                CEASE TRANSMISSION
              </button>
            </div>
          )}
        </div>

        {/* Center Column: Rescue AI Assistant Chatbot */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 flex flex-col justify-between h-[450px]">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2 mb-3">
            <Bot className="h-4 w-4 text-neon-blue" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>Rescue AI Assistant</span>
              <span className="rounded bg-neon-purple/20 px-1 py-0.5 text-[8px] text-neon-purple font-semibold">STANDBY</span>
            </span>
          </div>

          {/* Chat Logs */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 font-mono text-[9px] leading-relaxed">
            {chatLog.map((chat, idx) => (
              <div
                key={idx}
                className={`flex flex-col rounded p-2.5 max-w-[90%] ${
                  chat.sender === "user"
                    ? "ml-auto border border-neon-blue/30 bg-neon-blue/5 text-neon-cyan text-right"
                    : "mr-auto border border-cyber-border/20 bg-white/5 text-gray-300"
                }`}
              >
                <span className="text-[7px] font-bold text-gray-500 mb-1">
                  {chat.sender === "user" ? "CITIZEN FEED" : "RESCUE_CORE_AI"}
                </span>
                <div className="whitespace-pre-line text-left">{chat.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="mr-auto text-gray-500 animate-pulse">
                RESCUE_AI SEARCHING METEOROLOGICAL DATABASES...
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask for active survival protocols..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded border border-cyber-border/40 bg-black/40 p-2.5 font-mono text-[10px] text-white focus:border-neon-blue focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-neon-blue px-4 text-white shadow-glow-blue hover:opacity-90 active:scale-95 flex items-center justify-center"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Shelters & Rescue Dispatch Contacts */}
        <div className="rounded-2xl border border-cyber-border/40 bg-dark-bg/60 p-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-cyber-border/20 pb-2">
            <Map className="h-4 w-4 text-neon-cyan" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Surrounding Extraction Points
            </span>
          </div>

          {beaconData ? (
            <div className="space-y-5 font-mono text-[9px]">
              
              {/* Nearby Shelters list */}
              <div className="space-y-2">
                <span className="text-gray-400">SHELTER LOCATION MAP MATRIX:</span>
                <div className="space-y-2">
                  {beaconData.shelters.map((shelter, index) => (
                    <div key={index} className="rounded border border-cyber-border/20 bg-white/5 p-2.5 flex flex-col gap-1">
                      <div className="flex justify-between text-white font-bold">
                        <span>{shelter.name}</span>
                        <span className="text-neon-cyan">{shelter.distance_km} KM</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[8px]">
                        <span>COORDINATE MAPPED</span>
                        <span className="text-yellow-500">{shelter.capacity_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotlines */}
              <div className="space-y-2 border-t border-cyber-border/20 pt-4">
                <span className="text-gray-400">RESCUE SERVICE DISPATCH HOTLINES:</span>
                <div className="space-y-1.5">
                  {beaconData.contacts.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center rounded bg-black/40 p-2">
                      <span className="text-gray-300 font-medium">{contact.department}</span>
                      <a href={`tel:${contact.hotline}`} className="text-neon-red font-bold flex items-center space-x-1">
                        <Phone className="h-3 w-3 mr-0.5" />
                        <span>{contact.hotline}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 space-y-3 font-mono">
              <MapPin className="h-8 w-8 text-cyber-border/50 animate-pulse" />
              <div className="text-xs text-gray-500">ENGAGE EMERGENCY BEACON PROTOCOL TO MAPPED LOCATION SCHEMES</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
