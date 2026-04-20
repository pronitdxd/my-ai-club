"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // <-- This was the missing line!

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Identity Sync Function ---
  const syncAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      // Fetch admin status from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      
      setIsAdmin(profile?.is_admin || false);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    syncAuth();

    // Monitor login and logout events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAdmin(false);
      } else {
        syncAuth();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // --- The Nuclear Logout Function ---
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      // Force a full browser reload to clear any cached data
      window.location.href = "/"; 
    } catch (err) {
      window.location.href = "/";
    }
  };

  return (
    <nav className="fixed top-0 w-full z-[100] px-8 py-5 flex justify-between items-center backdrop-blur-xl border-b border-emerald-500/10 bg-black/40 font-outfit">
      
      {/* BRANDING */}
      <Link href="/" className="text-white font-michroma tracking-tighter text-lg italic uppercase hover:text-emerald-500 transition-all">
        NFSU AI CLUB
      </Link>

      <div className="flex items-center gap-8">
        <Link href="/about" className="text-[10px] text-zinc-400 hover:text-emerald-500 uppercase tracking-widest font-bold transition-colors">About</Link>
        <Link href="/campus" className="text-[10px] text-zinc-400 hover:text-emerald-500 uppercase tracking-widest font-bold transition-colors">Campus</Link>
        <Link href="/blog" className="text-[10px] text-zinc-400 hover:text-emerald-500 uppercase tracking-widest font-bold transition-colors">Projects</Link>

        {/* MEMBER DASHBOARD LINK */}
        {user && (
          <Link href="/dashboard" className="text-[10px] text-emerald-500/80 hover:text-emerald-400 uppercase tracking-widest font-black border-b border-emerald-500/20 pb-1 transition-all">
            Dashboard
          </Link>
        )}

        {/* ADMIN PANEL LINK */}
        {user && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href="/admin" className="text-[10px] text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full bg-red-500/5 hover:bg-red-500 hover:text-white transition-all uppercase font-black tracking-tighter">
              Admin Panel
            </Link>
          </motion.div>
        )}

        {/* AUTH ACTIONS */}
        <div className="flex items-center gap-5 border-l border-zinc-800/50 pl-8">
          {user ? (
            <>
              <span className="text-[9px] text-zinc-500 hidden lg:block font-space-mono lowercase">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-zinc-900 text-white text-[9px] px-5 py-2 rounded-full border border-zinc-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-michroma uppercase font-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="bg-emerald-600 text-black text-[10px] font-black px-6 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all font-michroma uppercase italic"
            >
              Member Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}