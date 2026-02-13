"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Initial Check
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) checkAdminStatus(user.id);
    };

    initializeAuth();

    // 2. Listen for Login/Logout changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        checkAdminStatus(currentUser.id);
      } else {
        setIsAdmin(false); // Reset admin status on logout
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Function to check the profiles table for is_admin flag
  async function checkAdminStatus(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setIsAdmin(data.is_admin);
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-emerald-500/10 bg-black/50 font-mono">
      <Link href="/" className="text-white font-black tracking-tighter text-xl hover:text-emerald-500 transition-colors">
        HOME
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/about" className="text-[10px] text-zinc-400 hover:text-emerald-500 transition-colors uppercase tracking-widest">
          About
        </Link>
        
        <Link href="/blog" className="text-[10px] text-zinc-400 hover:text-emerald-500 transition-colors uppercase tracking-widest">
          Projects
        </Link>

        {/* --- ADMIN ONLY LINK --- */}
        {user && isAdmin && (
          <Link href="/admin" className="text-[10px] text-red-500 border border-red-500/20 px-2 py-1 rounded bg-red-500/5 hover:bg-red-500 hover:text-white transition-all uppercase tracking-tighter">
            Admin Panel
          </Link>
        )}
        
        {user ? (
          <div className="flex items-center gap-4 border-l border-zinc-800 pl-6">
            <span className="text-[9px] text-emerald-500/50 hidden md:block">[{user.email}]</span>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="bg-zinc-800 text-white text-[9px] px-4 py-2 rounded hover:bg-red-500/20 hover:text-red-500 transition-all border border-zinc-700 uppercase"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="bg-emerald-600 text-black text-[10px] font-bold px-4 py-2 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all uppercase"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}