"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ projectCount: 0 });

  useEffect(() => {
    const fetchMemberData = async () => {
      // 1. Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch projects belonging ONLY to this user
      const { data: projects, count } = await supabase
        .from("projects")
        .select("*", { count: 'exact' })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMyProjects(projects || []);
      setStats({ projectCount: count || 0 });
      setLoading(false);
    };

    fetchMemberData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0c0f0e] flex items-center justify-center font-space-mono text-emerald-500 italic text-xs animate-pulse">SYNCHRONIZING PROFILE...</div>;
  }

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#0c0f0e] text-white font-outfit relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: `linear-gradient(to right, #10b98115 1px, transparent 1px), linear-gradient(to bottom, #10b98115 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
      />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Profile Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-zinc-900/40 p-10 rounded-3xl border border-emerald-500/10 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-michroma text-emerald-500 uppercase italic tracking-tighter mb-2">Member Dashboard</h1>
            <p className="font-space-mono text-[10px] text-zinc-500 uppercase tracking-widest">Logged in as: <span className="text-zinc-300">{user.email}</span></p>
          </div>

          <div className="flex gap-10">
             <div className="text-center">
                <p className="text-[9px] text-zinc-600 uppercase font-space-mono mb-2">Projects Contributed</p>
                <div className="relative inline-block">
                    <span className="text-5xl font-michroma text-emerald-400 leading-none">{stats.projectCount}</span>
                    <motion.div 
                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        className="h-[2px] bg-emerald-500 mt-2 origin-left"
                    />
                </div>
             </div>
             <div className="text-center border-l border-zinc-800 pl-10">
                <p className="text-[9px] text-zinc-600 uppercase font-space-mono mb-2">Status</p>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-full font-bold uppercase tracking-widest">Verified Member</span>
             </div>
          </div>
        </div>

        {/* My Submissions List */}
        <div className="space-y-6">
          <h2 className="font-michroma text-[12px] text-zinc-400 uppercase tracking-[0.4em] mb-8 italic">Your Indexed Records</h2>
          
          {myProjects.length === 0 ? (
            <div className="p-20 border border-zinc-900 rounded-3xl text-center">
               <p className="text-zinc-600 font-space-mono text-xs uppercase mb-6 tracking-widest">You haven't uploaded any projects yet.</p>
               <button onClick={() => router.push("/blog")} className="px-8 py-3 bg-emerald-600 text-black rounded-full font-michroma font-black text-[10px] uppercase hover:bg-emerald-400 transition-all">Submit First Project</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {myProjects.map((p) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={p.id} 
                  className="bg-zinc-900/60 border border-zinc-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-michroma text-zinc-200 group-hover:text-emerald-400 transition-colors uppercase tracking-tighter">{p.title}</h3>
                    <span className="text-[8px] font-space-mono text-zinc-700">ID: {p.id.split('-')[0]}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-outfit mb-6 line-clamp-3">{p.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                    <span className="text-[8px] font-space-mono text-zinc-700 uppercase">{new Date(p.created_at).toLocaleDateString()}</span>
                    {p.github_url && (
                        <a href={p.github_url} target="_blank" className="text-[9px] text-emerald-500 hover:underline uppercase font-bold">View Repo</a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}