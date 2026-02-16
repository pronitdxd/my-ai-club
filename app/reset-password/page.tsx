"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("SYNCHRONIZING NEW CREDENTIALS...");

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setStatus("ERROR: " + error.message);
      setLoading(false);
    } else {
      setStatus("SUCCESS: PASSWORD UPDATED. REDIRECTING...");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#0c0f0e] flex items-center justify-center p-6 font-outfit">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: `linear-gradient(to right, #10b98115 1px, transparent 1px), linear-gradient(to bottom, #10b98115 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900/50 border border-emerald-500/20 p-10 rounded-3xl backdrop-blur-xl z-10 shadow-2xl text-center"
      >
        <h1 className="text-2xl font-michroma text-emerald-500 mb-2 uppercase italic tracking-tighter">New Credentials</h1>
        <p className="text-[10px] text-zinc-500 font-space-mono mb-8 uppercase tracking-[0.3em]">Update Terminal Access Password</p>

        {status && (
          <div className="mb-6 p-3 bg-black border-l-2 border-emerald-500 text-[10px] text-emerald-400 font-space-mono italic">
            {"> "} {status}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <input 
            type="password" 
            required 
            placeholder="ENTER NEW PASSWORD" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm text-white outline-none focus:border-emerald-500 transition-all font-space-mono" 
          />
          <button 
            disabled={loading}
            className="w-full bg-emerald-600 text-black py-4 rounded-full font-michroma font-black text-[10px] uppercase hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            {loading ? "SAVING..." : "Complete Recovery"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}