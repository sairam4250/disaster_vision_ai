"use client";

import React, { useEffect, useRef, useState } from "react";

export default function RadarScanner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detectedTargets, setDetectedTargets] = useState<Array<{ x: number; y: number; label: string; strength: number; age: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);
    const center = { x: width / 2, y: height / 2 };
    const maxRadius = Math.min(width, height) / 2 - 10;

    let angle = 0;
    let targets: Array<{ angle: number; distance: number; label: string; strength: number; age: number }> = [
      { angle: 0.8, distance: 0.4, label: "ANOMALY-A", strength: 88, age: 0 },
      { angle: 2.3, distance: 0.75, label: "TORNADO-V1", strength: 94, age: 0 },
      { angle: 4.1, distance: 0.6, label: "SEISMIC-Z4", strength: 65, age: 0 },
      { angle: 5.5, distance: 0.25, label: "THERMAL-H2", strength: 72, age: 0 },
    ];

    let animationId: number;

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 300;
      height = canvas.height = canvas.parentElement?.clientHeight || 300;
      center.x = width / 2;
      center.y = height / 2;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      // Clear canvas with trace fading effect
      ctx.fillStyle = "rgba(3, 7, 18, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Rings
      ctx.strokeStyle = "rgba(0, 209, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let r = maxRadius / 4; r <= maxRadius; r += maxRadius / 4) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Crosshairs
      ctx.beginPath();
      ctx.moveTo(center.x - maxRadius, center.y);
      ctx.lineTo(center.x + maxRadius, center.y);
      ctx.moveTo(center.x, center.y - maxRadius);
      ctx.lineTo(center.x, center.y + maxRadius);
      ctx.stroke();

      // Sweep Beam Line
      const sweepX = center.x + Math.cos(angle) * maxRadius;
      const sweepY = center.y + Math.sin(angle) * maxRadius;

      // Draw sweeping gradient (radar beam)
      const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, maxRadius);
      grad.addColorStop(0, "rgba(0, 209, 255, 0.05)");
      grad.addColorStop(1, "rgba(0, 209, 255, 0.15)");
      
      // Sweep sector drawing
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.arc(center.x, center.y, maxRadius, angle - 0.25, angle);
      ctx.closePath();
      ctx.fill();

      // Draw actual sweep line
      ctx.strokeStyle = "rgba(0, 209, 255, 0.8)";
      ctx.shadowColor = "rgba(0, 209, 255, 0.8)";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();
      
      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw & Update Targets
      targets.forEach((t) => {
        // Calculate coordinate of target
        const tx = center.x + Math.cos(t.angle) * (maxRadius * t.distance);
        const ty = center.y + Math.sin(t.angle) * (maxRadius * t.distance);

        // Check if radar sweep angle crosses target angle (within threshold)
        const targetSweepDiff = Math.abs((angle % (Math.PI * 2)) - t.angle);
        if (targetSweepDiff < 0.05) {
          t.age = 100; // Reset age to max brightness
        }

        if (t.age > 0) {
          const alpha = t.age / 100;
          
          // Draw target dot
          ctx.fillStyle = `rgba(255, 77, 77, ${alpha})`;
          ctx.shadowColor = `rgba(255, 77, 77, ${alpha})`;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(tx, ty, 5, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 0;

          // Target reticle bracket
          ctx.strokeStyle = `rgba(255, 77, 77, ${alpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(tx - 9, ty - 9, 18, 18);

          // Target Label Text
          ctx.fillStyle = `rgba(0, 245, 255, ${alpha})`;
          ctx.font = "8px monospace";
          ctx.fillText(`${t.label}: ${t.strength}%`, tx + 12, ty + 3);

          t.age -= 0.5; // Slowly fade out
        }
      });

      // Update Sweep Angle
      angle = (angle + 0.015) % (Math.PI * 2);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <canvas ref={canvasRef} className="rounded-full border border-cyber-border/40" />
      <div className="absolute top-4 left-4 font-mono text-[9px] text-neon-blue/60 tracking-wider">
        SYS-RADAR: ACTIVE<br />
        RANGE: 2500 KM<br />
        SCAN RATE: 24 FPS
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[9px] text-neon-red/60 tracking-wider">
        TARGET DETECTED: {detectedTargets.length || 4}<br />
        WARN STATE: CRITICAL
      </div>
    </div>
  );
}
