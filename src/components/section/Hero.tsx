// components/Hero.tsx
"use client";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Hero() {
  const router = useRouter();
    const [user, setUser] = useState("");
  
  
    useEffect(() => {
      const loadUser = async () => {
        const res = await fetch("/api/me");
        const data = await res.json();  
        setUser(data.user);
      };
      console.log("USER IN HERO:", user);
      loadUser();
    }, []);
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#2a2a2a_1px,transparent_0)] bg-[length:40px_40px] opacity-30" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-center px-6 max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Get <span className="text-[#7847eb]">Unstuck</span> on Any DSA Topic
        </h1>

        <p className="text-gray-300 text-lg md:text-xl mb-8">
          <span className="text-white font-medium">LeetHelper</span> analyzes your coding profile and suggests 
          personalized problems to help you master topics efficiently — one question at a time.
        </p>

        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push(user === "" ? "/sign-in": "/home")} className="bg-[#7847eb] hover:bg-[#693bd8] text-white px-6 py-3 rounded-xl text-lg transition">
            Get Started
          </Button>
          <Button variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-800 px-6 py-3 rounded-xl text-lg">
            Learn More
          </Button>
        </div>
      </motion.div>

      {/* Floating Glow Effect */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
        }}
        className="absolute -bottom-24 w-[600px] h-[600px] bg-[#7847eb] opacity-25 blur-[120px] rounded-full"
      />
    </section>
  );
}
