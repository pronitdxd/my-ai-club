"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing Terminal...");
  
  // Data States
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMembers: 0, totalProjects: 0 });

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/");
      } else {
        setStatus("Access Granted. Syncing Club Database...");
        await fetchData();
      }
    };
    checkAdminAndFetch();
  }, []);

  async function fetchData() {
    // 1. Fetch All Profiles (Members)
    const { data: profs, count: mCount } = await supabase
      .from("profiles")
      .select("*", { count: 'exact' })
      .order('email', { ascending: true });

    // 2. Fetch All Projects
    const { data: projs, count: pCount } = await supabase
      .from("projects")
      .select("*", { count: 'exact' })
      .order('created_at', { ascending: false });

    // 3. Fetch All Transmission Messages (Inbox)
    const { data: msgs } = await supabase
      .from("contact_messages")
      .select("*")
      .order('created_at', { ascending: false });

    setMembers(profs || []);
    setProjects(projs || []);
    setMessages(msgs || []);
    setStats({ totalMembers: mCount || 0, totalProjects: pCount || 0 });
    setLoading(false);
  }

  // --- ACTIONS: MEMBERS ---
  async function toggleBlock(userId: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    if (!confirm(`Confirm security restriction: ${nextStatus ? 'Block' : 'Unblock'} this member?`)) return;
    const { error } = await supabase.from("profiles").update({ is_blocked: nextStatus }).eq("id", userId);
    if (!error) fetchData();
  }

  async function removeUser(userId: string) {
    if (!confirm("⚠️ PERMANENT TERMINATION: Remove this member from registry?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (!error) fetchData();
  }

  // --- ACTIONS: PROJECTS ---
  async function deleteProject(id: string) {
    if (!confirm("Terminate this project record?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) fetchData();
  }

  // --- ACTIONS: INBOX ---
  async function wipeMessage(id: string) {
    if (!confirm("Wipe this message from transmission log?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) fetchData();
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0c0f0e] flex flex-col items-center justify-center font-space-mono text-emerald-500">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase tracking-[0.3em] italic">{status}</p>
    </div>
  );

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#0c0f0e] text-white font-outfit relative">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER & GLOBAL STATS */}
        <div className="mb-12 border-b border-red-500/20 pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-michroma text-red-500 uppercase italic tracking-tighter">Command Center</h1>
            <p className="font-space-mono text-[10px] text-zinc-500 tracking-[0.3em] mt-2 uppercase italic">Verified Admin Identity: pronitd07@gmail.com</p>
          </div>
          <div className="flex gap-10">
            <div className="text-center">
              <p className="text-[9px] text-zinc-600 uppercase font-space-mono mb-1 tracking-widest">Total Members</p>
              <p className="text-2xl font-michroma text-emerald-500">{stats.totalMembers}</p>
            </div>
            <div className="text-center border-l border-zinc-800 pl-10">
              <p className="text-[9px] text-zinc-600 uppercase font-space-mono mb-1 tracking-widest">Live Projects</p>
              <p className="text-2xl font-michroma text-emerald-500">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* COLUMN 1: MEMBER REGISTRY */}
          <section className="space-y-6">
            <h2 className="font-michroma text-[11px] text-emerald-500 uppercase tracking-[0.3em] italic border-b border-emerald-500/10 pb-2">Member Registry</h2>
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className={`p-5 rounded-3xl border transition-all ${m.is_blocked ? 'border-red-500/30 bg-red-500/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
                  <p className={`text-xs font-space-mono truncate ${m.is_blocked ? 'text-red-400 line-through' : 'text-zinc-300'}`}>{m.email}</p>
                  <div className="flex gap-2 mt-4">
                    {m.is_admin ? (
                      <span className="text-[8px] bg-red-600/20 text-red-500 px-4 py-1.5 rounded-full font-black uppercase italic tracking-tighter">Root Authority</span>
                    ) : (
                      <>
                        <button onClick={() => toggleBlock(m.id, m.is_blocked)} className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase transition-all ${m.is_blocked ? 'bg-emerald-600 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-red-500'}`}>
                          {m.is_blocked ? "Unblock" : "Block"}
                        </button>
                        <button onClick={() => removeUser(m.id)} className="px-4 py-1.5 rounded-full text-[8px] font-bold uppercase bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">Terminate</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMN 2: PROJECT CONTROL */}
          <section className="space-y-6">
            <h2 className="font-michroma text-[11px] text-emerald-500 uppercase tracking-[0.3em] italic border-b border-emerald-500/10 pb-2">Project Control</h2>
            <div className="space-y-3">
              {projects.length === 0 ? <p className="text-[10px] text-zinc-700 italic font-space-mono">No project data found.</p> : projects.map(p => (
                <div key={p.id} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-3xl group hover:border-red-500/20 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-[11px] font-michroma text-zinc-200 uppercase leading-tight tracking-tighter">{p.title}</h3>
                    <button onClick={() => deleteProject(p.id)} className="text-[8px] bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full hover:bg-red-600 hover:text-white transition-all font-black uppercase">Wipe</button>
                  </div>
                  <p className="text-[9px] text-zinc-600 font-space-mono uppercase tracking-widest italic">Author: {p.author_name || 'System'}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMN 3: TRANSMISSION INBOX */}
          <section className="space-y-6">
            <h2 className="font-michroma text-[11px] text-emerald-500 uppercase tracking-[0.3em] italic border-b border-emerald-500/10 pb-2">Transmission Inbox</h2>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-[10px] text-zinc-700 italic text-center py-10 font-space-mono">Inbox Empty // No Transmissions.</p>
              ) : messages.map(msg => (
                <div key={msg.id} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl group transition-all hover:border-emerald-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-[10px] font-michroma text-emerald-400 uppercase italic mb-1">{msg.name}</h4>
                      <p className="text-zinc-600 font-space-mono text-[9px] lowercase">{msg.email}</p>
                    </div>
                    <button onClick={() => wipeMessage(msg.id)} className="text-zinc-700 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                    <p className="text-xs text-zinc-400 leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}