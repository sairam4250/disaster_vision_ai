"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type ParticleMode = "rain" | "lightning" | "smoke" | "storm" | "none";

interface WeatherContextType {
  particleMode: ParticleMode;
  setParticleMode: (mode: ParticleMode) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [particleMode, setParticleMode] = useState<ParticleMode>("none");

  return (
    <WeatherContext.Provider value={{ particleMode, setParticleMode }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
