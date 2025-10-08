// app/about/page.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#2a2a2a_1px,transparent_0)] bg-[length:40px_40px] opacity-20" />

      <section className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-6"
        >
          About <span className="text-[#7847eb]">LeetHelper</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-300 max-w-3xl mx-auto text-lg mb-16"
        >
          LeetHelper is a personalized DSA learning assistant built to help students overcome coding
          roadblocks. Our system analyzes your profile and suggests curated problems and topics so
          you can focus on what matters most — learning efficiently.
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-semibold mb-10"
        >
          Meet the Team
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            {
              name: "Divy Raj",
              role: "Model Training Lead",
              desc: "Responsible for training and optimizing the ML model that powers LeetHelper’s smart topic recommendations.",
            },
            {
              name: "Akshay",
              role: "Frontend & UX Developer",
              desc: "Built the website and crafted the user experience, ensuring everything looks and feels intuitive.",
            },
            {
              name: "Manish",
              role: "Backend & Deployment Engineer",
              desc: "Handles server-side logic, APIs, and deployment — keeping the platform reliable and scalable.",
            },
          ].map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-[#141414] border border-[#1f1f1f] hover:border-[#7847eb]/60 rounded-2xl p-8 transition-all duration-300"
            >
              <div className="mb-4">
                <Image
                  src="/avatar-placeholder.png" // replace with real image if available
                  alt={member.name}
                  width={80}
                  height={80}
                  className="mx-auto rounded-full border border-[#2a2a2a]"
                />
              </div>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-[#7847eb] text-sm mb-2">{member.role}</p>
              <p className="text-gray-400 text-sm">{member.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-gray-500 text-sm mt-16"
        >
          Made with ❤️ as a Mini Project by our 3-member team.
        </motion.p>
      </section>
    </main>
  );
}
