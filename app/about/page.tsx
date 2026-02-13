"use client";
import { motion } from "framer-motion";

export default function AboutPage() {
  const divisions = [
    { title: "AI-ML Learning", desc: "We focus on learning Artificial Intelligence and Machine Learning through a practical, hands-on approach. Instead of only studying theory, we explore concepts step by step and apply them through coding sessions." },
    { title: "DSA-Daily", desc: "We practice Data Structures and Algorithms (DSA) daily to build strong problem-solving skills and logical thinking. By consistently solving coding questions, we strengthen our understanding of concepts like arrays, linked lists, stacks, queues, trees, graphs, recursion, and dynamic programming." },
    { title: "Problem Solving Skills", desc: "Problem-solving skills are at the core of everything we do in our Coding and AI Club. We focus on developing the ability to break complex problems into smaller, manageable parts and approach them with logic and clarity. Instead of rushing to solutions, we learn to analyze constraints, think about multiple approaches, and choose the most efficient one." }
  ];

  return (
    <main className="min-h-screen pt-32 px-10 bg-[#050505] font-mono">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-black text-emerald-500 mb-6 italic underline decoration-zinc-800 underline-offset-8">
          WHAT ARE WE?
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-12">
          The NFSU Coding & AI Club's motive is to build a strong, innovative, and collaborative community of students passionate about technology, programming, and artificial intelligence. We aim to provide a platform where members can strengthen their coding skills, explore emerging AI technologies, and work on meaningful, real-world projects. Through workshops, hackathons, peer learning sessions, and hands-on development, the club encourages continuous learning and practical problem-solving.

We are committed to nurturing logical thinking, creativity, and ethical responsibility while developing solutions that create positive impact. By fostering teamwork, leadership, and technical excellence, the Coding and AI Club strives to prepare its members to become confident developers, researchers, and innovators ready to shape the future of technology.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {divisions.map((div, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-lg hover:border-emerald-500/50 transition-all"
            >
              <h3 className="text-emerald-500 font-bold mb-2 text-sm">[{div.title}]</h3>
              <p className="text-[11px] text-zinc-500 leading-tight">{div.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}