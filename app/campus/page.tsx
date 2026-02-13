"use client";
export default function CampusPage() {
  return (
    <main className="min-h-screen pt-32 px-10 bg-[#050505] font-mono">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-black text-white italic mb-4">NFSU DHARWAD</h1>
        <p className="text-emerald-500 text-xs tracking-[0.5em] mb-12 uppercase">Coding and AI Club</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 group hover:border-emerald-500/30 transition-all overflow-hidden relative">
             <span className="text-zinc-700 font-bold italic text-4xl group-hover:scale-110 transition-transform">AI LAB 01</span>
             <div className="absolute bottom-4 left-4 text-[9px] text-zinc-500">SYSTEM ONLINE</div>
          </div>
          <div className="h-64 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 group hover:border-emerald-500/30 transition-all overflow-hidden relative">
             <span className="text-zinc-700 font-bold italic text-4xl group-hover:scale-110 transition-transform">MAIN ACADEMIC</span>
             <div className="absolute bottom-4 left-4 text-[9px] text-zinc-500">GPS: 15.45°N 75.00°E</div>
          </div>
        </div>
      </div>
    </main>
  );
}