import type { Metadata } from "next";
import "./globals.css";
import { WeatherProvider } from "@/components/WeatherContext";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "DisasterVision AI | Cinematic Meteorological Hazard Grid",
  description: "Predict tomorrow, save today. Modern AI-powered natural disaster forecasting dashboard utilizing scikit-learn models and real-time NASA & weather APIs.",
  keywords: ["disaster forecasting", "natural disasters", "machine learning", "meteorological telemetry", "NASA data interface"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        {/* Cinematic Webfonts Fallback */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Roboto+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-dark-bg text-foreground font-sans">
        <WeatherProvider>
          <Layout>{children}</Layout>
        </WeatherProvider>
      </body>
    </html>
  );
}
