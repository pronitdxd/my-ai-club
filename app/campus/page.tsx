"use client";
import { motion } from "framer-motion";

export default function CampusPage() {
  const locations = [
    { 
      title: "AI Innovation Lab", 
      image: "/lab.jpg", 
      status: "System Active",
      coords: "15.4589 N, 75.0078 E"
    },
    { 
      title: "Main Academic Block", 
      image: "/campus1.jpg", 
      status: "Secure Zone",
      coords: "15.4592 N, 75.0081 E"
    }
  ];

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#0c0f0e] font-outfit text-white">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px' }} 
      />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-michroma text-white uppercase italic tracking-tighter"
          >
            NFSU Dharwad
          </motion.h1>
          <p className="mt-4 text-emerald-500 font-space-mono text-[10px] tracking-[0.6em] uppercase">
            Campus Intelligence Registry
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {locations.map((loc, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-80 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 transition-all duration-500"
            >
              <div className="absolute inset-0 opacity-40 group-hover:opacity-80 transition-all">
                <img src={loc.image} alt={loc.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-8 left-8">
                <span className="text-[8px] font-space-mono text-emerald-500 uppercase tracking-widest">{loc.status}</span>
                <h3 className="text-xl font-michroma text-white uppercase italic">{loc.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- INTERACTIVE GOOGLE MAPS SECTION --- */}
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-emerald-500/20" />
                <h2 className="font-michroma text-[12px] text-emerald-500 uppercase tracking-[0.4em] italic">Satellite Uplink Established</h2>
                <div className="h-[1px] flex-1 bg-emerald-500/20" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full h-[450px] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl"
            >
                {/* Data Overlays for the map */}
                <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md border border-emerald-500/20 px-4 py-2 rounded-full">
                    <p className="text-[9px] font-space-mono text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Live Feed: Dharwad Node
                    </p>
                </div>

                {/* The Map Iframe */}
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.5413158098236!2d75.01912447582522!3d15.401490256247345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d36371f54d03%3A0xc3457a44f216262b!2sNational%20Forensic%20Sciences%20University%20(NFSU)%2C%20Dharwad!5e0!3m2!1sen!2sin!4v1716300000000!5m2!1sen!2sin"
                    className="w-full h-full grayscale invert contrast-[1.2] opacity-80"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(150deg) brightness(0.7)' }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                {/* Subtle Grid Overlay over the map to keep the tech look */}
                <div className="absolute inset-0 pointer-events-none border-[20px] border-zinc-950/20" />
            </motion.div>

            <div className="flex justify-between items-center px-4">
                <p className="text-[8px] font-space-mono text-zinc-600 uppercase tracking-widest">
                    Operational Range: 50km Radius
                </p>
                <p className="text-[8px] font-space-mono text-zinc-600 uppercase tracking-widest">
                    Signal Strength: Optimal
                </p>
            </div>
        </div>
      </div>
    </main>
  );
}