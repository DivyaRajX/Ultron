// app/how-it-works/page.tsx
"use client";
import { motion } from "framer-motion";
import { User, Brain, ListChecks } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <User size={36} className="text-[#7847eb]" />,
      title: "Step 1: Enter Your Profile",
      desc: "Start by entering your LeetCode or coding profile. This helps us understand your problem-solving history and overall strengths.",
    },
    {
      icon: <ListChecks size={36} className="text-[#7847eb]" />,
      title: "Step 2: Select Your Weak Topics",
      desc: "Tell us where you struggle — arrays, DP, graphs, or recursion. You can even add custom topics or notes for deeper personalization.",
    },
    {
      icon: <Brain size={36} className="text-[#7847eb]" />,
      title: "Step 3: Get AI-Powered Recommendations",
      desc: "Our AI model analyzes your input and generates a list of personalized problems to help you master your weak areas efficiently.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#2a2a2a_1px,transparent_0)] bg-[length:40px_40px] opacity-20" />

      <section className="relative max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-6"
        >
          How <span className="text-[#7847eb]">LeetHelper</span> Works
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-300 text-lg mb-16 max-w-3xl mx-auto"
        >
          LeetHelper combines your profile insights with AI-driven analysis to give you tailored DSA
          practice recommendations — focused, effective, and personal.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#141414] border border-[#1f1f1f] hover:border-[#7847eb]/60 rounded-2xl p-8 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="p-4 bg-[#1e1e1e] rounded-full mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <p className="text-gray-400 text-base">
            It’s that simple — your personalized roadmap to DSA mastery starts in just a few clicks.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
