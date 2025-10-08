"use client";
import { motion } from "framer-motion";
import { Lightbulb, Brain, Target, LineChart } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-[#7847eb]" />,
      title: "Personalized Learning Paths",
      desc: "AI analyzes your strengths and weaknesses to create a focused roadmap just for you.",
    },
    {
      icon: <Target className="w-8 h-8 text-[#7847eb]" />,
      title: "Weak Topic Detection",
      desc: "Instantly identify weak areas with intelligent analysis to improve efficiently.",
    },
    {
      icon: <LineChart className="w-8 h-8 text-[#7847eb]" />,
      title: "Progress Insights",
      desc: "Track your learning growth visually with data-backed progress analytics.",
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-[#7847eb]" />,
      title: "Smart Recommendations",
      desc: "Receive curated study materials and exercises based on your learning behavior.",
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white bg-[#0a0a0a]">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl px-6 py-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl font-bold mb-16 text-[#fff]"
        >
          ⚡ Powerful Features to Boost Your Learning
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-[#1a1a1a]/80 border border-white/10 hover:border-[#7847eb]/60 hover:shadow-[0_0_20px_#7847eb33] transition-all duration-300"
            >
              <div className="flex justify-center mb-5">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
