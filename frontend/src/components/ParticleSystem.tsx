"use client";

import React, { useEffect, useRef } from "react";

interface ParticleSystemProps {
  mode: "rain" | "lightning" | "smoke" | "storm" | "none";
}

export default function ParticleSystem({ mode }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Re-adjust size on window resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle Classes
    class RainParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * -height;
      vy: number = Math.random() * 15 + 15;
      length: number = Math.random() * 20 + 10;
      opacity: number = Math.random() * 0.3 + 0.15;

      update() {
        this.y += this.vy;
        if (this.y > height) {
          this.y = Math.random() * -50;
          this.x = Math.random() * width;
          this.vy = Math.random() * 15 + 15;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.strokeStyle = `rgba(0, 209, 255, ${this.opacity})`;
        c.lineWidth = 1;
        c.moveTo(this.x, this.y);
        c.lineTo(this.x, this.y + this.length);
        c.stroke();
      }
    }

    class AshParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      vx: number = Math.random() * 2 - 1 + 0.5; // Drift right
      vy: number = -(Math.random() * 1.5 + 0.5); // Rise up
      size: number = Math.random() * 3 + 1;
      opacity: number = Math.random() * 0.6 + 0.2;
      color: string = Math.random() > 0.4 ? "rgba(255, 90, 50," : "rgba(100, 100, 100,";

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -10 || this.x > width + 10 || this.x < -10) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `${this.color} ${this.opacity})`;
        c.fill();
      }
    }

    class StormParticle {
      angle: number = Math.random() * Math.PI * 2;
      radius: number = Math.random() * (Math.min(width, height) / 2);
      speed: number = (Math.random() * 0.02 + 0.005);
      size: number = Math.random() * 2 + 1;
      opacity: number = Math.random() * 0.5 + 0.2;

      update() {
        this.angle += this.speed;
        // Spiral slowly inwards
        this.radius -= 0.1;
        if (this.radius < 10) {
          this.radius = Math.random() * (Math.min(width, height) / 2) + 50;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        // Spiral around screen center
        const cx = width / 2;
        const cy = height / 2;
        const x = cx + Math.cos(this.angle) * this.radius;
        const y = cy + Math.sin(this.angle) * this.radius;

        c.beginPath();
        c.arc(x, y, this.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(123, 47, 247, ${this.opacity})`;
        c.fill();
      }
    }

    // Initialize Particles
    const rainCount = 100;
    const ashCount = 80;
    const stormCount = 150;
    
    const rainList: RainParticle[] = Array.from({ length: rainCount }, () => new RainParticle());
    const ashList: AshParticle[] = Array.from({ length: ashCount }, () => new AshParticle());
    const stormList: StormParticle[] = Array.from({ length: stormCount }, () => new StormParticle());

    let lightningFlash = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Handle lightning flashing
      if (mode === "lightning") {
        if (Math.random() > 0.985 && lightningFlash === 0) {
          lightningFlash = Math.floor(Math.random() * 15) + 5;
        }
        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(lightningFlash % 2 === 0 ? 0.08 : 0.02) * (lightningFlash / 10)})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash--;
        }
      }

      // Draw depending on mode
      if (mode === "rain" || mode === "lightning") {
        rainList.forEach((p) => {
          p.update();
          p.draw(ctx);
        });
      } else if (mode === "smoke") {
        ashList.forEach((p) => {
          p.update();
          p.draw(ctx);
        });
      } else if (mode === "storm") {
        stormList.forEach((p) => {
          p.update();
          p.draw(ctx);
        });
      } else if (mode === "none") {
        // Floating ambient grid particles
        ctx.fillStyle = "rgba(0, 209, 255, 0.03)";
        ctx.fillRect(0, 0, width, height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-80"
    />
  );
}
