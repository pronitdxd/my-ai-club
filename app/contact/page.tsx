"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("TRANSMITTING...");

    const { error } = await supabase.from("contact_messages").insert([
      { name, email, content: message }
    ]);

    if (error) {
      setStatus("ERROR: " + error.message);
    } else {
      setStatus("MESSAGE RECEIVED. SECURE LINK CLOSED.");
      setName(""); setEmail(""); setMessage("");
    }
  };

  return (
    <main className="min-h-screen pt-32 px-10 bg-[#0c0f0e] font-outfit flex items-center justify-center relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: `linear-gradient(to right, #10b98115 1px, transparent 1px), linear-gradient(to bottom, #10b98115 1px, transparent 1px)`, backgroundSize: '45px 45px' }} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-zinc-900/50 border border-emerald-500/10 p-10 rounded-3xl backdrop-blur-xl z-10 shadow-2xl"
      >
        <h1 className="text-2xl text-emerald-500 font-michroma mb-2 italic uppercase tracking-tighter">Contact Registry</h1>
        <p className="text-[10px] font-space-mono text-zinc-500 mb-8 uppercase tracking-[0.3em]">Send Encrypted Message</p>
        
        {status && (
          <div className="mb-6 p-3 bg-black border-l-2 border-emerald-500 text-[10px] text-emerald-400 font-space-mono animate-pulse">
            {"> "} {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase ml-4 tracking-widest font-space-mono">Identity Name</label>
            <input type="text" required placeholder="STUDENT NAME" value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm focus:border-emerald-500 outline-none text-white transition-all" />
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase ml-4 tracking-widest font-space-mono">Return Path</label>
            <input type="email" required placeholder="EMAIL ADDRESS" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm focus:border-emerald-500 outline-none text-white transition-all" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-500 uppercase ml-4 tracking-widest font-space-mono">Payload Content</label>
            <textarea required rows={4} placeholder="ENTER MESSAGE HERE" value={message} onChange={(e)=>setMessage(e.target.value)} className="w-full bg-black border border-zinc-800 p-5 rounded-3xl text-sm focus:border-emerald-500 outline-none text-white transition-all"></textarea>
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-black py-4 rounded-full font-michroma font-black text-[10px] uppercase hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] mt-4">
            Transmit Message
          </button>
        </form>
      </motion.div>
    </main>
  );
}