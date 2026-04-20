"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Initial Identity and Security Check
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await performSecurityCheck(user.id);
      }
    };

    initializeAuth();

    // 2. Listen for Real-time Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await performSecurityCheck(currentUser.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // --- SECURITY OVERRIDE: Check for Admin and Blocked Status ---
  async function performSecurityCheck(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin, is_blocked")
      .eq("id", userId)
      .single();

    if (!error && data) {
      // If Admin has blocked this user, force logout immediately
      if (data.is_blocked) {
        alert("Security Alert: Your access to the NFSU AI Club has been restricted.");
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }
      setIsAdmin(data.is_admin);
    }
  }

  return (
    <nav className="fixed top-0 w-full z-[100] px-8 py-5 flex justify-between items-center backdrop-blur-xl border-b border-emerald-500/10 bg-black/40 font-outfit">
      
      {/* Logo Branding */}
      <Link href="/" className="group flex items-center gap-3">
        <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:animate-ping transition-all" />
        <span className="text-white font-michroma tracking-tighter text-lg italic uppercase">
          NFSU AI CLUB
        </span>
      </Link>

      {/* Center Navigation Links */}
      <div className="flex items-center gap-8">
        <Link href="/about" className="text-[10px] text-zinc-400 hover:text-emerald-500 uppercase tracking-[0.2em] transition-all font-bold">
          About
        </Link>
        <Link href="/campus" className="text-[10px] text-zinc-400 hover:text-emerald-500 uppercase tracking-[0.2em] transition-all font-bold">
          Campus
        </Link>
        <Link href="/blog" className="text-[10px] text-zinc-400 hover:text-emerald-500 uppercase tracking-[0.2em] transition-all font-bold">
          Projects
        </Link>

        {/* Member Link */}
        {user && (
          <Link href="/dashboard" className="text-[10px] text-emerald-500/80 hover:text-emerald-400 uppercase tracking-[0.2em] transition-all font-black border-b border-emerald-500/20 pb-1">
            Dashboard
          </Link>
        )}

        {/* Admin Link */}
        {user && isAdmin && (
          <Link href="/admin" className="text-[10px] text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full bg-red-500/5 hover:bg-red-600 hover:text-white transition-all uppercase font-black tracking-tighter">
            Admin Panel
          </Link>
        )}

        {/* Auth Action Area */}
        <div className="flex items-center gap-5 border-l border-zinc-800/50 pl-8">
          {user ? (
            <>
              <span className="text-[9px] text-zinc-600 font-space-mono hidden lg:block uppercase tracking-tighter">
                {user.email}
              </span>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="bg-zinc-900 text-zinc-400 text-[9px] px-5 py-2 rounded-full border border-zinc-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-michroma uppercase font-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="bg-emerald-600 text-black text-[10px] font-black px-6 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all font-michroma uppercase italic tracking-widest"
            >
              Member Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}