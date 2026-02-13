"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [debugLog, setDebugLog] = useState("Initializing System...");

  useEffect(() => {
    const checkAdmin = async () => {
      setDebugLog("Verifying Identity...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDebugLog("No User Found. Redirecting...");
        router.push("/login");
        return;
      }

      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profError || !profile?.is_admin) {
        setDebugLog("Access Denied: Not an Admin.");
        setTimeout(() => router.push("/"), 2000);
      } else {
        setDebugLog("Identity Verified. Fetching Data...");
        fetchData();
      }
    };
    checkAdmin();
  }, []);

  async function fetchData() {
    try {
      // Fetch Profiles
      const { data: profs, error: e1 } = await supabase.from("profiles").select("*");
      if (e1) setDebugLog("Error fetching profiles: " + e1.message);
      setMembers(profs || []);

      // Fetch Messages
      const { data: msgs, error: e2 } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (e2) {
        setDebugLog("Inbox Error: " + e2.message);
      } else {
        setDebugLog("All Systems Operational. Messages Synced.");
        setMessages(msgs || []);
      }
    } catch (err: any) {
      setDebugLog("Critical Error: " + err.message);
    }
    setLoading(false);
  }

  async function wipeMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) fetchData();
  }

  if (loading && debugLog.includes("Verifying")) {
    return <div className="min-h-screen bg-[#0c0f0e] flex items-center justify-center font-space-mono text-emerald-500 italic text-xs animate-pulse">BOOTING ADMIN TERMINAL...</div>;
  }

  return (
    <main className="min-h-screen pt-32 pb-20 px-10 bg-[#0c0f0e] font-outfit text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* DEBUG LOG PANEL */}
        <div className="mb-10 p-4 bg-black border border-emerald-500/20 rounded-2xl font-space-mono text-[10px] text-emerald-400">
           <span className="text-emerald-500/50 mr-2">SYSTEM LOG:</span> {debugLog}
        </div>

        <h1 className="text-4xl font-michroma text-red-500 mb-10 italic uppercase tracking-tighter">Command Center</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* MEMBERS SECTION */}
          <section>
            <h2 className="text-emerald-500 font-michroma text-xs tracking-widest uppercase italic mb-6">Active Members</h2>
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="p-4 bg-zinc-900/40 border border-zinc-800 flex justify-between items-center rounded-full px-6">
                  <span className="text-[11px] font-space-mono text-zinc-300">{m.email}</span>
                  {m.is_admin && <span className="text-[8px] text-red-500 font-bold border border-red-500/20 px-3 py-1 rounded-full uppercase">Admin</span>}
                </div>
              ))}
            </div>
          </section>

          {/* MESSAGES SECTION */}
          <section>
            <h2 className="text-emerald-500 font-michroma text-xs tracking-widest uppercase italic mb-6">Message Inbox</h2>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="p-10 border border-zinc-900 rounded-3xl text-center text-zinc-700 text-[10px] uppercase font-space-mono italic">
                  No transmissions found in registry.
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl group transition-all hover:border-emerald-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-emerald-400 font-michroma text-[10px] uppercase italic mb-1">{msg.name}</h3>
                        <p className="text-zinc-600 font-space-mono text-[9px]">{msg.email}</p>
                      </div>
                      <button 
                        onClick={() => wipeMessage(msg.id)}
                        className="bg-red-600/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-[8px] font-black hover:bg-red-600 hover:text-white transition-all uppercase"
                      >
                        Wipe
                      </button>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                      <p className="text-zinc-400 text-xs leading-relaxed font-outfit">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}