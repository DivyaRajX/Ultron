// components/Benefits.tsx
"use client";
import { motion } from "framer-motion";
import { Code2, Brain, Target, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/cards";

const benefits = [
  {
    icon: <Brain size={32} className="text-[#7847eb]" />,
    title: "Smart Topic Detection",
    desc: "LeetHelper analyzes your coding profile and detects weak areas using intelligent algorithms.",
  },
  {
    icon: <Target size={32} className="text-[#7847eb]" />,
    title: "Personalized Problem Sets",
    desc: "Get question recommendations tailored to your current level and specific problem areas.",
  },
  {
    icon: <Code2 size={32} className="text-[#7847eb]" />,
    title: "Track Your Progress",
    desc: "Visualize improvement over time with stats and streak-based motivation.",
  },
  {
    icon: <Sparkles size={32} className="text-[#7847eb]" />,
    title: "Instant Guidance",
    desc: "Stuck on a topic? Get hints, topic summaries, and similar problems instantly.",
  },
];

export default function Benefits() {
  return (
    <section id="features" className="relative py-24 bg-[#0a0a0a] text-white">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#2a2a2a_1px,transparent_0)] bg-[length:40px_40px] opacity-20" />

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-10"
        >
          Why Choose <span className="text-[#7847eb]">LeetHelper</span>?
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#141414] border border-[#1f1f1f] hover:border-[#7847eb]/60 transition-all duration-300 rounded-2xl shadow-lg h-full">
                <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                  <div className="p-3 bg-[#1e1e1e] rounded-full">{b.icon}</div>
                  <h3 className="text-xl font-semibold">{b.title}</h3>
                  <p className="text-gray-400 text-sm">{b.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
