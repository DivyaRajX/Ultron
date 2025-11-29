"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function Home() {
  const [profile, setProfile] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStats(null);
    setParsed(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: profile,
          question:
            "Summarise my problems and give pros/cons and next suggested question",
          sub_limit: 200,
        }),
      });

      const data = await res.json();
      console.log("API OUTPUT:", data);

      if (data.error) throw new Error(data.error);

      setStats(data.stats || null);
      setParsed(data.parsed || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">
          LeetHelper <span className="text-[#7847eb]">AI</span>
        </h1>

        {/* INPUT FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 bg-[#141414] border border-[#1f1f1f] rounded-xl p-4">
            <User className="text-[#7847eb]" />
            <input
              type="text"
              placeholder="LeetCode username"
              className="bg-transparent w-full outline-none"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7847eb] hover:bg-[#693bd8] text-white rounded-xl py-3"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Get Recommendations"}
          </Button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {/* STATS */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6"
          >
            <h2 className="text-2xl text-[#7847eb] mb-4">Your Stats</h2>
            <ul className="text-gray-300 space-y-2">
              <li>Easy Solved: {stats.solved_easy}</li>
              <li>Medium Solved: {stats.solved_medium}</li>
              <li>Hard Solved: {stats.solved_hard}</li>
              <li>Recent Failed Topics: {stats.recent_failed_topics.length}</li>
            </ul>
          </motion.div>
        )}

        {/* AI PARSED ANALYSIS */}
        {parsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6"
          >
            <h2 className="text-2xl text-[#7847eb] mb-4">AI Analysis</h2>

            {/* SUMMARY */}
            <p className="text-gray-300 whitespace-pre-wrap mb-6">
              {parsed.summary}
            </p>

            {/* PROS */}
            {parsed.pros?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl text-[#7847eb] mb-2">Pros</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {parsed.pros.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* CONS */}
            {parsed.cons?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl text-[#7847eb] mb-2">Cons</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {parsed.cons.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* NEXT QUESTION */}
            {parsed.next_question && (
              <div className="mt-8">
                <h3 className="text-xl text-[#7847eb] mb-2">Next Question</h3>

                <p className="text-gray-300 mb-1">
                  <strong>Title:</strong> {parsed.next_question.title}
                </p>
                <p className="text-gray-300 mb-1">
                  <strong>Difficulty:</strong>{" "}
                  {parsed.next_question.difficulty}
                </p>

                <p className="text-gray-300 mb-1">
                  <strong>Topics:</strong>{" "}
                  {parsed.next_question.topics}
                </p>

                <p className="text-gray-300 mt-3">
                  <strong>Why this problem:</strong> <br />
                  {parsed.next_question.reason}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
