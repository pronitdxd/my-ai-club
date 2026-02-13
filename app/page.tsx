"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. NEURAL NETWORK (Bright & Visible)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number; y: number; vx: number; vy: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.2; 
        this.vy = (Math.random() - 0.5) * 0.2;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 70; i++) particles.push(new Particle());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Particles are bright and clear
      ctx.fillStyle = "rgba(16, 255, 150, 0.7)"; 
      ctx.strokeStyle = "rgba(16, 255, 150, 0.2)"; 

      particles.forEach((p, i) => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        const dx = p.x - mousePos.x;
        const dy = p.y - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Interaction: Lines connecting to mouse (The interactivity)
        if (dist < 250) {
          ctx.beginPath();
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = `rgba(16, 255, 150, ${0.4 - dist / 800})`;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.stroke();
        }

        // Connection between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize(); init(); draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [mousePos]);

  return (
    <main 
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      className="relative flex min-h-screen flex-col items-center justify-center bg-[#0c0f0e] text-white overflow-hidden font-outfit"
    >
      {/* --- LAYER 1: BRIGHT VISIBLE GRID --- */}
      <div className="absolute inset-0 z-0 opacity-40" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #10b98120 1px, transparent 1px), linear-gradient(to bottom, #10b98120 1px, transparent 1px)`,
          backgroundSize: '45px 45px' 
        }} 
      />

      {/* --- LAYER 2: THE NEURAL CANVAS --- */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* --- LAYER 3: MAIN CONTENT --- */}
      <div className="text-center z-20 select-none px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-michroma tracking-tighter uppercase leading-tight"
          >
            CODING & 
            <br />
            <span className="text-emerald-500 font-michroma drop-shadow-[0_0_20px_rgba(16,255,150,0.5)]">AI CLUB</span>
          </motion.h1>
          
          <p className="mt-6 text-emerald-400 font-space-mono tracking-[0.5em] uppercase text-[10px] md:text-xs">
            National Forensic Sciences University, Dharwad
          </p>
        </motion.div>

        {/* --- MODERN OVAL BUTTONS --- */}
        <div className="mt-20 flex flex-wrap gap-5 justify-center items-center">
          {[
            { name: "About Us", href: "/about", primary: false },
            { name: "Projects", href: "/blog", primary: false },
            { name: "Campus", href: "/campus", primary: false },
            { name: "Contact", href: "/contact", primary: false },
            { name: "Member Login", href: "/login", primary: true }
          ].map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
            >
              <Link 
                href={link.href} 
                className={`
                  relative px-8 py-3.5 text-[11px] font-michroma uppercase tracking-[0.2em] transition-all duration-300 rounded-full
                  ${link.primary 
                    ? "bg-emerald-500 text-black font-black shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-400" 
                    : "bg-emerald-500/5 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 backdrop-blur-md"
                  }
                `}
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- CORNER DECORATIONS --- */}
      <div className="absolute bottom-10 left-10 font-space-mono text-[9px] text-emerald-500/50 space-y-1 hidden lg:block tracking-widest uppercase">
        <p>System: Online</p>
        <p>Terminal: {mousePos.x} : {mousePos.y}</p>
      </div>
    </main>
  );
}