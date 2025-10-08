"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, ListChecks, Brain } from "lucide-react";

export default function Home() {
  const [profile, setProfile] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: call backend/AI API here
    setTimeout(() => {
      setRecommendations([
        "Practice Dynamic Programming - Medium",
        "Graph Traversal - Hard",
        "Backtracking - Medium",
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white py-24 px-6 relative">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#2a2a2a_1px,transparent_0)] bg-[length:40px_40px] opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Welcome to <span className="text-[#7847eb]">LeetHelper</span>
        </h1>
        <p className="text-gray-300 text-center mb-12">
          Enter your profile info and weak topics, and our AI will give you personalized coding problem recommendations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile input */}
          <div className="flex items-center gap-3 bg-[#141414] border border-[#1f1f1f] rounded-xl p-4">
            <User className="text-[#7847eb]" />
            <input
              type="text"
              placeholder="Your LeetCode / Coding profile URL"
              className="bg-transparent w-full outline-none text-white placeholder-gray-500"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              required
            />
          </div>

          {/* Weak topics input */}
          <div className="flex items-center gap-3 bg-[#141414] border border-[#1f1f1f] rounded-xl p-4">
            <ListChecks className="text-[#7847eb]" />
            <input
              type="text"
              placeholder="Weak topics (comma separated)"
              className="bg-transparent w-full outline-none text-white placeholder-gray-500"
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
              required
            />
          </div>

          {/* Other notes input */}
          <div className="flex items-center gap-3 bg-[#141414] border border-[#1f1f1f] rounded-xl p-4">
            <Brain className="text-[#7847eb]" />
            <input
              type="text"
              placeholder="Other notes (optional)"
              className="bg-transparent w-full outline-none text-white placeholder-gray-500"
              value={otherNotes}
              onChange={(e) => setOtherNotes(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7847eb] hover:bg-[#693bd8] text-white rounded-xl py-3 text-lg"
          >
            {loading ? "Generating Recommendations..." : "Get Recommendations"}
          </Button>
        </form>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-[#7847eb]">Your Recommendations</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
