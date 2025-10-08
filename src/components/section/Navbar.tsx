// components/Navbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">
          <span className="text-[#7847eb]">Leet</span>Helper
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/features" className="hover:text-white transition">Features</Link>
          <Link href="/working" className="hover:text-white transition">How It Works</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Button onClick={() => router.push("/home")} className="bg-[#7847eb] hover:bg-[#693bd8] text-white rounded-xl px-5 py-2">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-300 hover:text-white transition"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden flex flex-col items-center gap-6 bg-[#0a0a0a] py-6 border-t border-[#1a1a1a]">
          <Link href="/features" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white transition">Features</Link>
          <Link href="/working" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white transition">How It Works</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white transition">Pricing</Link>
          <Link href="/about" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white transition">About</Link>
          <Button onClick={() => router.push("/home")} className="bg-[#7847eb] hover:bg-[#693bd8] text-white rounded-xl px-6 py-2">
            Get Started
          </Button>
        </div>
      )}
    </nav>
  );
}
