"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase"; 
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  // --- UI States ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [isResetMode, setIsResetMode] = useState(false); // New state for Forgot Password
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // --- Form Data ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");

  // --- LOGIC: MEMBER LOGIN ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("🔐 VERIFYING MEMBER CREDENTIALS...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(`❌ ACCESS DENIED: ${error.message}`);
      setLoading(false);
    } else {
      setStatus("✅ WELCOME BACK");
      setTimeout(() => router.push("/"), 1500); // Redirect to Home
    }
  };

  // --- LOGIC: FORGOT PASSWORD ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("📧 SENDING RECOVERY LINK...");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setStatus(`❌ ERROR: ${error.message}`);
    } else {
      setStatus("✅ RECOVERY LINK DISPATCHED TO EMAIL");
    }
    setLoading(false);
  };

  // --- LOGIC: JOIN CLUB (Invite -> Details -> OTP) ---
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
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-outfit">
      <div className="w-full max-w-md bg-zinc-900 border border-emerald-500/20 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
        
        {/* Toggle Bar */}
        {!isResetMode && (
          <div className="flex mb-10 bg-black/50 p-1 rounded-full border border-zinc-800">
            <button 
              onClick={() => {setIsLoginMode(true); setStatus("");}}
              className={`flex-1 py-2 text-[10px] uppercase tracking-widest transition-all rounded-full ${isLoginMode ? 'bg-emerald-600 text-black font-bold' : 'text-zinc-500 hover:text-emerald-500'}`}
            >
              Member Login
            </button>
            <button 
              onClick={() => {setIsLoginMode(false); setStep(1); setStatus("");}}
              className={`flex-1 py-2 text-[10px] uppercase tracking-widest transition-all rounded-full ${!isLoginMode ? 'bg-emerald-600 text-black font-bold' : 'text-zinc-500 hover:text-emerald-500'}`}
            >
              Join Club
            </button>
          </div>
        )}

        {status && <div className="mb-6 p-2 bg-emerald-500/5 border-l-2 border-emerald-500 text-[10px] text-emerald-400 font-space-mono animate-pulse uppercase">{">"} {status}</div>}

        <AnimatePresence mode="wait">
          {isResetMode ? (
            /* --- FORGOT PASSWORD MODE --- */
            <motion.form key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleForgotPassword} className="space-y-4 text-center">
               <h2 className="text-xl font-michroma text-emerald-500 uppercase italic">Recover Access</h2>
               <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6 font-space-mono">Enter registered email</p>
               <input type="email" required placeholder="EMAIL ADDRESS" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm outline-none focus:border-emerald-500" />
               <button className="w-full bg-emerald-600 p-4 rounded-full font-michroma font-black text-black uppercase text-xs">Send Reset Link</button>
               <button type="button" onClick={() => setIsResetMode(false)} className="text-[9px] text-zinc-600 uppercase underline mt-4 tracking-tighter">Back to login</button>
            </motion.form>
          ) : isLoginMode ? (
            /* --- LOGIN MODE --- */
            <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSignIn} className="space-y-4 text-center">
              <h2 className="text-xl font-michroma text-emerald-500 uppercase italic">Access Terminal</h2>
              <input type="email" required placeholder="EMAIL ADDRESS" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm focus:border-emerald-500 outline-none" />
              <input type="password" required placeholder="PASSWORD" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm focus:border-emerald-500 outline-none" />
              <button className="w-full bg-emerald-600 p-4 rounded-full font-michroma font-black text-black uppercase text-xs">Authorize Login</button>
              <button type="button" onClick={() => setIsResetMode(true)} className="text-[9px] text-zinc-600 uppercase underline mt-2">Forgot Password?</button>
            </motion.form>
          ) : (
            /* --- SIGNUP MODE --- */
            <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-michroma text-emerald-500 uppercase italic">{step === 1 ? "Security Clearance" : "Details"}</h2>
              </div>
              {step === 1 && (
                <form onSubmit={handleVerifyInvite} className="space-y-4">
                  <input type="text" required placeholder="INVITE CODE" value={inviteCode} onChange={(e)=>setInviteCode(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-center text-emerald-500 tracking-[0.4em] font-bold outline-none" />
                  <button className="w-full bg-emerald-600 p-4 rounded-full font-black text-black text-xs uppercase">Verify</button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleInitialSignup} className="space-y-4">
                  <input type="text" required placeholder="FULL NAME" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm outline-none" />
                  <input type="email" required placeholder="EMAIL" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm outline-none" />
                  <input type="password" required placeholder="PASSWORD" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-full text-sm outline-none" />
                  <button className="w-full bg-emerald-600 p-4 rounded-full font-black text-black text-xs uppercase">Send OTP</button>
                </form>
              )}
              {step === 3 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <input type="text" required placeholder="OTP TOKEN" maxLength={8} value={otp} onChange={(e)=>setOtp(e.target.value)} className="w-full bg-black border border-emerald-500/40 p-4 rounded-full text-center text-xl tracking-[0.5em] text-emerald-500 font-black outline-none" />
                  <button className="w-full bg-emerald-600 p-4 rounded-full font-black text-black text-xs uppercase">Confirm</button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}