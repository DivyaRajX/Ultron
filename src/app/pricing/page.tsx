// app/pricing/page.tsx
"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#2a2a2a_1px,transparent_0)] bg-[length:40px_40px] opacity-20" />

      <section className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-6"
        >
          Simple, Transparent <span className="text-[#7847eb]">Pricing</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-300 text-lg mb-16 max-w-3xl mx-auto"
        >
          LeetHelper is currently <span className="text-[#7847eb] font-semibold">100% free</span> for all users.
          No hidden fees, no subscriptions — just pure learning assistance while we’re in development.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-md mx-auto bg-[#141414] border border-[#1f1f1f] hover:border-[#7847eb]/60 rounded-2xl shadow-lg p-10 flex flex-col items-center"
        >
          <h2 className="text-3xl font-semibold mb-2">Free Forever (for now)</h2>
          <p className="text-gray-400 mb-6">All features unlocked while in early access.</p>

          <div className="flex flex-col gap-3 mb-8 text-gray-300 text-sm text-left">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#7847eb]" />
              Personalized problem recommendations
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#7847eb]" />
              Topic insights & weak area detection
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#7847eb]" />
              Progress tracking and performance stats
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#7847eb]" />
              Instant topic guidance and hints
            </div>
          </div>

          <Button className="bg-[#7847eb] hover:bg-[#693bd8] text-white rounded-xl px-8 py-3 text-lg">
            Start Learning — It’s Free
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-gray-500 text-sm mt-16"
        >
          Future premium plans will include advanced analytics and AI-driven challenge modes.
        </motion.p>
      </section>
    </main>
  );
}
