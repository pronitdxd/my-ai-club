"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserAndStatus();
    fetchProjects();
  }, []);

  async function fetchUserAndStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // Fetch profile to check admin status
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!error && profile?.is_admin) {
          console.log("ADMIN ACCESS: VERIFIED ✅");
          setIsAdmin(true);
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  }

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) setProjects(data);
    setLoading(false);
  }

  // --- ADMIN FUNCTION: DELETE ---
  async function handleDelete(projectId: string) {
    const confirmDelete = confirm("⚠️ SECURITY OVERRIDE: Terminate this project record?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      alert("Termination Error: " + error.message);
    } else {
      fetchProjects(); // Refresh list
    }
  }

  // --- MEMBER FUNCTION: UPLOAD ---
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setIsUploading(true);

    const { error } = await supabase.from("projects").insert([
      {
        title,
        description: desc,
        github_url: gitUrl,
        author_name: user.user_metadata?.display_name || user.email,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Registry Error: " + error.message);
    } else {
      setTitle(""); setDesc(""); setGitUrl("");
      fetchProjects();
    }
    setIsUploading(false);
  }

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#0c0f0e] text-white font-outfit">
      
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #10b98115 1px, transparent 1px), linear-gradient(to bottom, #10b98115 1px, transparent 1px)`,
          backgroundSize: '50px 50px' 
        }} 
      />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-emerald-500/20 pb-8">
          <h1 className="text-4xl font-michroma text-emerald-500 uppercase italic tracking-tighter">
           Project Feed
          </h1>
          <div className="flex justify-between items-center mt-2">
            <p className="font-space-mono text-[10px] text-zinc-500 tracking-[0.3em] uppercase">
            </p>
            {isAdmin && (
              <span className="bg-red-600/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest animate-pulse">
                ADMIN MODE
              </span>
            )}
          </div>
        </div>

        {/* Upload Form (Visible only to logged-in members) */}
        <AnimatePresence>
          {user ? (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 bg-zinc-900/40 border border-emerald-500/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl"
            >
              <h2 className="font-michroma text-sm text-emerald-400 mb-6 uppercase tracking-widest">New Project</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <input 
                  type="text" placeholder="PROJECT TITLE" value={title} onChange={(e)=>setTitle(e.target.value)} required
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-emerald-500 outline-none font-space-mono text-sm"
                />
                <textarea 
                  placeholder="TECHNICAL DESCRIPTION" value={desc} onChange={(e)=>setDesc(e.target.value)} required
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-emerald-500 outline-none font-space-mono text-sm h-28"
                />
                <input 
                  type="url" placeholder="REPOSITORY URL (GITHUB)" value={gitUrl} onChange={(e)=>setGitUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl focus:border-emerald-500 outline-none font-space-mono text-sm"
                />
                <button 
                  disabled={isUploading}
                  className="bg-emerald-600 text-black font-michroma text-[10px] px-10 py-4 rounded-full font-black hover:bg-emerald-400 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {isUploading ? "Committing..." : "Push_to_Registry"}
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="mb-16 p-8 border border-zinc-800/50 rounded-2xl bg-black/20 text-center backdrop-blur-sm">
              <p className="text-zinc-500 font-space-mono text-[10px] uppercase tracking-[0.3em]">
                Authentication Required to Upload Project Data
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Project Registry List */}
        <div className="space-y-8">
          <h3 className="font-space-mono text-[11px] text-zinc-600 uppercase mb-6 tracking-[0.5em] flex items-center gap-4">
            <span className="w-8 h-[1px] bg-zinc-800"></span>
            Live Database Feed
          </h3>
          
          {loading ? (
            <div className="flex items-center gap-3 text-emerald-500 font-space-mono text-xs italic animate-pulse">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Fetching Registry...
            </div>
          ) : projects.length === 0 ? (
            <p className="text-zinc-700 font-space-mono text-xs uppercase italic">Registry Empty // No Projects Indexed.</p>
          ) : (
            projects.map((project) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group relative border border-zinc-900 bg-zinc-900/10 p-8 rounded-3xl hover:border-emerald-500/20 transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-2xl font-michroma text-zinc-100 group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">
                      {project.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-space-mono uppercase mt-2 tracking-widest">
                      Author: <span className="text-emerald-500/70">{project.author_name}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* ADMIN DELETE BUTTON */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="text-[9px] font-black bg-red-600/10 text-red-500 border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all uppercase tracking-tighter"
                      >
                        Terminate Project
                      </button>
                    )}

                    {project.github_url && (
                      <a 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-500 hover:text-white transition-all p-2 bg-emerald-500/5 rounded-full border border-emerald-500/10 hover:border-emerald-500"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed font-outfit max-w-2xl group-hover:text-zinc-200 transition-colors">
                  {project.description}
                </p>

                <div className="mt-8 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-[8px] font-space-mono text-zinc-700 tracking-widest uppercase">
                  <span>Timestamp: {new Date(project.created_at).toLocaleString()}</span>
                  <span>ID: {project.id.split('-')[0]} // Status: Active</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}