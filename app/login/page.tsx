"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase"; 
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  // --- UI States ---
  const [isLoginMode, setIsLoginMode] = useState(true); // Default to Login
  const [step, setStep] = useState(1); // Only used for Signup
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // --- Form Data ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");

  // --- LOGIC: MEMBER LOGIN (No Code Needed) ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("🔐 VERIFYING MEMBER CREDENTIALS...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setStatus(`❌ ACCESS DENIED: ${error.message}`);
      setLoading(false);
    } else {
      setStatus("✅ WELCOME BACK ");
      setTimeout(() => router.push("/about"), 1500);
    }
  };

  // --- LOGIC: JOIN CLUB (3-Step Security) ---
  const handleVerifyInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("📡 SCANNING CLEARANCE CODE...");
    const { data, error } = await supabase.from("invite_codes").select("*").eq("code", inviteCode).eq("is_used", false).single();
    if (error || !data) {
      setStatus("❌ INVALID OR USED CODE.");
      setLoading(false);
    } else {
      setStatus("✅ CODE ACCEPTED. ENTER DETAILS.");
      setStep(2);
      setLoading(false);
    }
  };

  const handleInitialSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("📧 DISPATCHING SECURITY OTP...");
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: fullName } } });
    if (error) { setStatus(`❌ ERROR: ${error.message}`); setLoading(false); }
    else { setStatus("📩 OTP DISPATCHED."); setStep(3); setLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
    if (error) { setStatus(`❌ INVALID OTP.`); setLoading(false); }
    else {
      await supabase.from("invite_codes").update({ is_used: true, assigned_to: data.user?.id }).eq("code", inviteCode);
      setStatus("🚀 ENROLLMENT COMPLETE.");
      setTimeout(() => router.push("/about"), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-md bg-zinc-900 border border-emerald-500/20 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        
        {/* Toggle Bar */}
        <div className="flex mb-10 bg-black/50 p-1 rounded-lg border border-zinc-800">
          <button 
            onClick={() => {setIsLoginMode(true); setStatus("");}}
            className={`flex-1 py-2 text-[10px] uppercase tracking-widest transition-all ${isLoginMode ? 'bg-emerald-600 text-black font-bold rounded-md' : 'text-zinc-500 hover:text-emerald-500'}`}
          >
            Member Login
          </button>
          <button 
            onClick={() => {setIsLoginMode(false); setStep(1); setStatus("");}}
            className={`flex-1 py-2 text-[10px] uppercase tracking-widest transition-all ${!isLoginMode ? 'bg-emerald-600 text-black font-bold rounded-md' : 'text-zinc-500 hover:text-emerald-500'}`}
          >
            Join Club
          </button>
        </div>

        {status && <div className="mb-6 p-2 bg-emerald-500/5 border-l-2 border-emerald-500 text-[10px] text-emerald-400 font-bold uppercase tracking-tighter animate-pulse">{">"} {status}</div>}

        <AnimatePresence mode="wait">
          {isLoginMode ? (
            /* --- LOGIN MODE: ONLY EMAIL & PASSWORD --- */
            <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleSignIn} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-emerald-500 italic uppercase">Access Terminal</h2>
                <p className="text-[8px] text-zinc-600 tracking-[0.3em] uppercase">Enter Existing Credentials</p>
              </div>
              <input type="email" required placeholder="EMAIL  ADDRESS" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-emerald-500 outline-none" />
              <input type="password" required placeholder="PASSWORD" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-emerald-500 outline-none" />
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 p-4 rounded font-black text-black uppercase text-xs transition-all">Authorize Login</button>
            </motion.form>
          ) : (
            /* --- SIGNUP MODE: 3 STEPS --- */
            <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-emerald-500 italic uppercase">Enter Security Code</h2>
                <p className="text-[8px] text-zinc-600 tracking-[0.3em] uppercase"></p>
              </div>

              {step === 1 && (
                <form onSubmit={handleVerifyInvite} className="space-y-4">
                  <input type="text" required placeholder="XXXXXX" value={inviteCode} onChange={(e)=>setInviteCode(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded text-center text-emerald-500 tracking-[0.4em] font-bold outline-none" />
                  <button className="w-full bg-emerald-600 p-4 rounded font-black text-black text-xs uppercase">VERIFY</button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleInitialSignup} className="space-y-4">
                  <input type="text" required placeholder="FULL NAME" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded text-sm outline-none" />
                  <input type="email" required placeholder="EMAIL" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded text-sm outline-none" />
                  <input type="password" required placeholder="PASSWORD" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded text-sm outline-none" />
                  <button className="w-full bg-emerald-600 p-4 rounded font-black text-black text-xs uppercase">Send OTP</button>
                </form>
              )}
              {step === 3 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <input type="text" required placeholder="8-DIGIT OTP" maxLength={8} value={otp} onChange={(e)=>setOtp(e.target.value)} className="w-full bg-black border border-emerald-500/40 p-4 rounded text-center text-xl tracking-[0.5em] text-emerald-500 font-black outline-none" />
                  <button className="w-full bg-emerald-600 p-4 rounded font-black text-black text-xs uppercase">Verify Identity</button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}