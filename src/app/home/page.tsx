"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function Home() {
  const [profile, setProfile] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecommendations([]);
    setUserData(null);

    try {
      const res = await fetch(`/api/user/${profile}`);
      if (!res.ok) throw new Error("Failed to fetch LeetCode profile");

      const data = await res.json();
      setUserData(data);

      const easy = data.solved_easy;
      const medium = data.solved_medium;
      const hard = data.solved_hard;

      // Example recommendation logic
      let recs: string[] = [];

      if (easy >= 50 && medium < 30) {
        recs = [
          "Medium - Backtracking: Permutations",
          "Medium - Dynamic Programming: Coin Change",
          "Medium - Trees: Lowest Common Ancestor",
          "Medium - Graphs: Number of Islands",
        ];
      } else if (medium >= 50 && hard < 20) {
        recs = [
          "Hard - Dynamic Programming: Regular Expression Matching",
          "Hard - Graphs: Word Ladder II",
          "Hard - Greedy: Minimum Number of Refueling Stops",
          "Hard - Backtracking: N-Queens II",
        ];
      } else if (hard >= 20) {
        recs = [
          "Focus on contest participation",
          "Try harder graph problems like Dijkstra’s or Bellman-Ford variants",
          "Explore System Design / Database questions",
        ];
      } else {
        recs = [
          "Easy - Arrays: Two Sum",
          "Easy - Strings: Valid Palindrome",
          "Easy - HashMap: Majority Element",
          "Easy - Math: Power of Three",
        ];
      }

      setRecommendations(recs);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white py-24 px-6 relative">
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
          Enter your LeetCode username to get your progress details and
          problem recommendations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 bg-[#141414] border border-[#1f1f1f] rounded-xl p-4">
            <User className="text-[#7847eb]" />
            <input
              type="text"
              placeholder="Your LeetCode username"
              className="bg-transparent w-full outline-none text-white placeholder-gray-500"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7847eb] hover:bg-[#693bd8] text-white rounded-xl py-3 text-lg"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Get Recommendations"}
          </Button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {userData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-[#7847eb]">
              Your Profile Stats
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li>Easy Solved: {userData.solved_easy}</li>
              <li>Medium Solved: {userData.solved_medium}</li>
              <li>Hard Solved: {userData.solved_hard}</li>
              <li>Accuracy: {(userData.accuracy * 100).toFixed(1)}%</li>
            </ul>
          </motion.div>
        )}

        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-[#7847eb]">
              Recommended Next Problems
            </h2>
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
