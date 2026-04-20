"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMembers: 0 });

  useEffect(() => {
    verifyAndLoad();
  }, []);

  const verifyAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) { router.push("/"); return; }

    fetchMembers();
  };

  async function fetchMembers() {
    const { data, count } = await supabase.from("profiles").select("*", { count: 'exact' });
    setMembers(data || []);
    setStats({ totalMembers: count || 0 });
    setLoading(false);
  }

  // --- FUNCTION: BLOCK USER ---
  async function toggleBlock(id: string, currentStatus: boolean) {
    const action = currentStatus ? "unblock" : "block";
    if (!confirm(`Confirm security restriction: ${action} this user?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !currentStatus })
      .eq("id", id);

    if (error) alert(error.message);
    else fetchMembers();
  }

  // --- FUNCTION: REMOVE PROFILE ---
  async function removeUser(id: string) {
    if (!confirm("⚠️ PERMANENT TERMINATION: Remove this member from registry?")) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) alert(error.message);
    else fetchMembers();
  }

  if (loading) return <div className="min-h-screen bg-[#0c0f0e] flex items-center justify-center font-michroma text-emerald-500 animate-pulse uppercase tracking-widest text-[10px]">Accessing Database...</div>;

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[#0c0f0e] text-white font-outfit">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b border-red-500/20 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-michroma text-red-500 uppercase italic tracking-tighter">Command Center</h1>
            <p className="text-[10px] font-space-mono text-zinc-500 mt-2 uppercase tracking-widest italic">Member Registry Management</p>
          </div>
          <div className="text-right">
             <p className="text-[9px] text-zinc-600 uppercase mb-1">Total Registry</p>
             <p className="text-3xl font-michroma text-emerald-500 leading-none">{stats.totalMembers}</p>
          </div>
        </div>

        {/* Member List */}
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className={`p-6 bg-zinc-900/40 border ${member.is_blocked ? 'border-red-500/50' : 'border-zinc-800'} rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 transition-all`}>
              <div className="flex flex-col">
                <span className={`text-sm font-space-mono ${member.is_blocked ? 'text-red-400 line-through' : 'text-zinc-200'}`}>{member.email}</span>
                <span className="text-[8px] text-zinc-600 uppercase mt-1">Status: {member.is_blocked ? "Restricted" : "Active"}</span>
              </div>

              <div className="flex items-center gap-3">
                {member.is_admin ? (
                   <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic">Root Authority</span>
                ) : (
                  <>
                    {/* BLOCK BUTTON */}
                    <button 
                      onClick={() => toggleBlock(member.id, member.is_blocked)}
                      className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all ${member.is_blocked ? 'bg-emerald-600 text-black hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      {member.is_blocked ? "Unblock Access" : "Block Member"}
                    </button>

                    {/* REMOVE BUTTON */}
                    <button 
                      onClick={() => removeUser(member.id)}
                      className="px-5 py-2 bg-red-600/10 text-red-500 border border-red-500/30 rounded-full text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                      Terminate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}