"use client";

import React, { useRef, useEffect, useState } from "react";
import { Sparkles, Utensils, Wine, RefreshCw } from "lucide-react";

interface LuxuryCloche3dProps {
  propertyName?: string;
  tableOrRoom?: string;
  onExploreMenu?: () => void;
}

export function LuxuryCloche3d({
  propertyName = "Hôtel Le Vignoble",
  tableOrRoom = "Votre Table",
  onExploreMenu,
}: LuxuryCloche3dProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0.35);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const velocityRef = useRef(0.003);
  const angleRef = useRef(0.35);
  const liftProgressRef = useRef(0); // 0 (closed) to 1 (lifted)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = 240);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 240;
    };
    window.addEventListener("resize", handleResize);

    // Golden dust particles
    const particles = Array.from({ length: 32 }, () => ({
      x: (Math.random() - 0.5) * width * 0.8,
      y: (Math.random() - 0.5) * height * 0.8,
      z: Math.random() * 200 - 100,
      size: Math.random() * 2 + 0.8,
      opacity: Math.random() * 0.7 + 0.3,
      speedY: -(Math.random() * 0.4 + 0.2),
      swing: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth inertia rotation
      if (!isDraggingRef.current) {
        angleRef.current += velocityRef.current;
        velocityRef.current *= 0.985;
        if (Math.abs(velocityRef.current) < 0.001) {
          velocityRef.current = 0.002; // slow constant orbit
        }
      }

      // Smooth lift interpolation
      const targetLift = isOpen ? 1 : 0;
      liftProgressRef.current += (targetLift - liftProgressRef.current) * 0.12;
      const liftY = liftProgressRef.current * 48;

      const centerX = width / 2;
      const centerY = height / 2 + 18;
      const angle = angleRef.current;

      // 1. Luxury Pedestal / Plateau en marbre & bronze (3D disc)
      ctx.save();
      ctx.translate(centerX, centerY + 28);
      ctx.scale(1, 0.34);

      // Soft shadow
      const shadowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 130);
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
      shadowGrad.addColorStop(0.6, "rgba(20, 15, 10, 0.35)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.fill();

      // Lower pedestal rim
      ctx.lineWidth = 14;
      ctx.strokeStyle = "rgba(180, 140, 60, 0.4)";
      ctx.beginPath();
      ctx.arc(0, 10, 96, 0, Math.PI * 2);
      ctx.stroke();

      // Pedestal disc
      const plateGrad = ctx.createRadialGradient(-30, -30, 5, 0, 0, 96);
      plateGrad.addColorStop(0, "#2c2620");
      plateGrad.addColorStop(0.5, "#181512");
      plateGrad.addColorStop(0.85, "#2d2319");
      plateGrad.addColorStop(1, "#d4af37");
      ctx.fillStyle = plateGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 96, 0, Math.PI * 2);
      ctx.fill();

      // Gold inner concentric rim
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(212, 175, 55, 0.75)";
      ctx.beginPath();
      ctx.arc(0, 0, 84, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 2. Secret Content under cloche (Revealed when lifted)
      if (liftProgressRef.current > 0.05) {
        ctx.save();
        ctx.translate(centerX, centerY + 18);
        ctx.globalAlpha = Math.min(1, liftProgressRef.current * 1.5);

        // Chef's Signature Dish Mockup: Golden emblem
        const emblemGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 28);
        emblemGrad.addColorStop(0, "#fff5d0");
        emblemGrad.addColorStop(0.5, "#d4af37");
        emblemGrad.addColorStop(1, "#8a6d20");
        ctx.fillStyle = emblemGrad;
        ctx.beginPath();
        ctx.arc(0, -6, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#181512";
        ctx.font = "bold 11px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("VIGNOBLE", 0, -6);
        ctx.restore();
      }

      // 3. 3D Cloche Body (Lifted upward by liftY)
      ctx.save();
      ctx.translate(centerX, centerY - liftY);

      // Cloche base rim (ellipse in perspective)
      ctx.save();
      ctx.translate(0, 20);
      ctx.scale(1, 0.32);
      const rimGrad = ctx.createLinearGradient(-80, 0, 80, 0);
      rimGrad.addColorStop(0, "#7a5c18");
      rimGrad.addColorStop(0.3, "#fbe8a6");
      rimGrad.addColorStop(0.5, "#d4af37");
      rimGrad.addColorStop(0.7, "#8a6d20");
      rimGrad.addColorStop(1, "#f3db92");
      ctx.lineWidth = 7;
      ctx.strokeStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 82, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Curved Dome (Upper semi-spherical surface)
      const domeWidth = 82;
      const domeHeight = 70;

      // Specular highlight shifts based on angle
      const highlightShift = Math.sin(angle) * 28;

      const domeGrad = ctx.createRadialGradient(
        -18 + highlightShift,
        -16,
        6,
        0,
        0,
        domeWidth
      );
      domeGrad.addColorStop(0, "#ffffff"); // Hot specular shine
      domeGrad.addColorStop(0.15, "#fdf3cf"); // Warm gold sheen
      domeGrad.addColorStop(0.45, "#d4af37"); // Pure champagne gold
      domeGrad.addColorStop(0.75, "#967520"); // Deep bronze gold
      domeGrad.addColorStop(0.95, "#523e10"); // Shadowed brass
      domeGrad.addColorStop(1, "#362708"); // Edge occlusion

      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.moveTo(-domeWidth, 20);
      // Bézier curve for dome volume
      ctx.bezierCurveTo(
        -domeWidth,
        -domeHeight * 0.8,
        domeWidth,
        -domeHeight * 0.8,
        domeWidth,
        20
      );
      // Base arc
      ctx.bezierCurveTo(
        domeWidth * 0.6,
        34,
        -domeWidth * 0.6,
        34,
        -domeWidth,
        20
      );
      ctx.closePath();
      ctx.fill();

      // Additional secondary specular reflection curve
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(-24 + highlightShift * 0.6, -14, 18, 38, -Math.PI / 8, 0, Math.PI);
      ctx.stroke();
      ctx.restore();

      // Finial / Handle Ring (Poignée en or massif tournée)
      const handleY = -domeHeight * 0.72;
      const handleGrad = ctx.createRadialGradient(-3, handleY - 3, 2, 0, handleY, 12);
      handleGrad.addColorStop(0, "#ffffff");
      handleGrad.addColorStop(0.35, "#f8e7a2");
      handleGrad.addColorStop(0.8, "#d4af37");
      handleGrad.addColorStop(1, "#664e12");

      // Handle neck
      ctx.fillStyle = handleGrad;
      ctx.fillRect(-5, handleY, 10, 10);

      // Handle top sphere/crown
      ctx.beginPath();
      ctx.arc(0, handleY - 6, 9, 0, Math.PI * 2);
      ctx.fill();

      // Handle top ring
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#f3db92";
      ctx.beginPath();
      ctx.arc(0, handleY - 14, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // 4. Floating Sparkling Gold Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.swing += 0.03;
        const currentX = centerX + p.x + Math.sin(p.swing) * 6;
        const currentY = centerY + p.y;

        // Reset particle when it floats out of bounds
        if (p.y < -height / 2) {
          p.y = height / 2;
          p.x = (Math.random() - 0.5) * width * 0.7;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity * (1 - Math.abs(p.y) / (height / 2));
        ctx.fillStyle = "#ffdf7a";
        ctx.shadowColor = "#d4af37";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  // Pointer / Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    velocityRef.current = deltaX * 0.006;
    angleRef.current += deltaX * 0.008;
    setRotationAngle(angleRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const toggleCloche = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#181512] via-[#0f0e0c] to-[#1a1714] border border-[#d4af37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-24 right-0 w-60 h-60 bg-[#7c3c46]/15 blur-3xl rounded-full" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest text-amber-200/90 font-medium font-serif">
            Service en Direct • {propertyName}
          </span>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold tracking-wide">
          {tableOrRoom}
        </span>
      </div>

      {/* Interactive 3D Canvas */}
      <div
        className="relative my-1 cursor-grab active:cursor-grabbing select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-[220px] touch-none block"
        />

        {/* Floating action pill on the canvas */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            onClick={toggleCloche}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/30 text-[11px] text-amber-200 font-medium hover:bg-black/80 transition-all active:scale-95 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isOpen ? "Reposer le dôme royal" : "Soulever le dôme royal"}
          </button>
        </div>
      </div>

      {/* Footer controls & prompt */}
      <div className="relative z-10 pt-1 border-t border-amber-400/15 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-stone-400 text-[11px]">
          <RefreshCw className="w-3 h-3 text-amber-400/80 animate-spin" style={{ animationDuration: "14s" }} />
          <span>Faites glisser pour tourner en 3D</span>
        </div>
        {onExploreMenu && (
          <button
            onClick={onExploreMenu}
            className="text-[11px] font-semibold text-amber-300 hover:text-amber-100 underline decoration-amber-400/40 underline-offset-4"
          >
            Voir la carte du jour &darr;
          </button>
        )}
      </div>
    </div>
  );
}
