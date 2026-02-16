"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing Terminal...");
  
  // Data States
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMembers: 0, totalProjects: 0, totalMessages: 0 });

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      // 1. Verify User Session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Verify Admin Privileges from Profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/"); // Boot out if not admin
      } else {
        setStatus("Access Granted. Fetching Club Data...");
        await fetchData();
      }
    };

    checkAdminAndFetch();
  }, []);

  async function fetchData() {
    // Fetch Profiles (Members)
    const { data: profs, count: memberCount } = await supabase
      .from("profiles")
      .select("*", { count: 'exact' });

    // Fetch Projects
    const { data: projs, count: projCount } = await supabase
      .from("projects")
      .select("*", { count: 'exact' });

    // Fetch Messages
    const { data: msgs, count: msgCount } = await supabase
      .from("contact_messages")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false });

    setMembers(profs || []);
    setProjects(projs || []);
    setMessages(msgs || []);
    setStats({
      totalMembers: memberCount || 0,
      totalProjects: projCount || 0,
      totalMessages: msgCount || 0
    });
    setLoading(false);
  }

  // Action Functions
  async function deleteProject(id: string) {
    if (!confirm("Confirm removal of this project from the database?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchData();
  }

  async function deleteMessage(id: string) {
    if (!confirm("Wipe this message transmission?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0f0e] flex flex-col items-center justify-center font-space-mono text-emerald-500">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] uppercase tracking-[0.3em]">{status}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#0c0f0e] text-white font-outfit">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: `linear-gradient(to right, #10b98115 1px, transparent 1px), linear-gradient(to bottom, #10b98115 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Admin Header */}
        <div className="mb-12 border-b border-red-500/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-michroma text-red-500 uppercase italic tracking-tighter">Command Center</h1>
            <p className="font-space-mono text-[10px] text-zinc-500 tracking-[0.3em] mt-2 uppercase">Root Access Enabled // Secure Terminal</p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[9px] text-zinc-600 uppercase font-space-mono mb-1">Total Members</p>
              <p className="text-xl font-michroma text-emerald-500">{stats.totalMembers}</p>
            </div>
            <div className="text-center border-l border-zinc-800 pl-6">
              <p className="text-[9px] text-zinc-600 uppercase font-space-mono mb-1">Active Projects</p>
              <p className="text-xl font-michroma text-emerald-500">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Column 1: Member Registry */}
          <section className="space-y-6">
            <h2 className="font-michroma text-[11px] text-emerald-500 uppercase tracking-widest italic border-b border-emerald-500/10 pb-2">Member Registry</h2>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex justify-between items-center group hover:border-emerald-500/20 transition-all">
                  <span className="text-[11px] font-space-mono text-zinc-300 truncate mr-2">{member.email}</span>
                  {member.is_admin ? (
                    <span className="text-[8px] bg-red-600/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-full font-black uppercase">Root</span>
                  ) : (
                    <button className="text-[8px] text-zinc-600 hover:text-red-500 uppercase font-bold tracking-tighter transition-colors">Block</button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Column 2: Project Management */}
          <section className="space-y-6">
            <h2 className="font-michroma text-[11px] text-emerald-500 uppercase tracking-widest italic border-b border-emerald-500/10 pb-2">Project Control</h2>
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project.id} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-3xl group hover:border-red-500/20 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xs font-michroma text-zinc-200 uppercase tracking-tighter">{project.title}</h3>
                    <button onClick={() => deleteProject(project.id)} className="text-[8px] bg-red-600/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-full hover:bg-red-600 hover:text-white transition-all uppercase font-black">Wipe</button>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-space-mono uppercase">By: {project.author_name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Column 3: Transmission Inbox (Messages) */}
          <section className="space-y-6">
            <h2 className="font-michroma text-[11px] text-emerald-500 uppercase tracking-widest italic border-b border-emerald-500/10 pb-2">Transmission Inbox</h2>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-[10px] text-zinc-700 font-space-mono uppercase italic text-center py-10">No messages in buffer</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-[10px] font-michroma text-emerald-500 uppercase italic mb-1">{msg.name}</h4>
                        <p className="text-[9px] text-zinc-600 font-space-mono">{msg.email}</p>
                      </div>
                      <button onClick={() => deleteMessage(msg.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                      <p className="text-xs text-zinc-400 leading-relaxed">{msg.content}</p>
                    </div>
                    <p className="text-[7px] text-zinc-800 font-space-mono mt-4 text-right uppercase tracking-[0.2em]">{new Date(msg.created_at).toLocaleDateString()}</p>
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