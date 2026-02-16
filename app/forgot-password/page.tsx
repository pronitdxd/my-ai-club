"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleReset = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setStatus(`Error: ${error.message}`);
    else {
      setStatus("Password Updated. Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 font-outfit">
      <div className="w-full max-w-md bg-zinc-900 border border-emerald-500/20 p-8 rounded-3xl text-center">
        <h2 className="text-xl font-michroma text-emerald-500 uppercase mb-6">New Password</h2>
        {status && <p className="text-emerald-400 text-xs mb-4">{status}</p>}
        <form onSubmit={handleReset} className="space-y-4">
          <input type="password" required placeholder="ENTER NEW PASSWORD" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm outline-none" />
          <button className="w-full bg-emerald-600 text-black py-4 rounded-full font-michroma font-black text-xs uppercase">Update Password</button>
        </form>
      </div>
    </main>
  );
}