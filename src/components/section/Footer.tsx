// components/Footer.tsx
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            <span className="text-[#7847eb]">Leet</span>Helper
          </h2>
          <p className="text-sm text-gray-400">
            Helping you get unstuck and master DSA — one problem at a time.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-semibold mb-2">Quick Links</h3>
          <Link href="#features" className="hover:text-white transition">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition">How It Works</Link>
          <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="#about" className="hover:text-white transition">About</Link>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-white font-semibold mb-3">Connect</h3>
          <div className="flex gap-4">
            <Link href="https://github.com" target="_blank" className="hover:text-[#7847eb] transition">
              <Github size={22} />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-[#7847eb] transition">
              <Twitter size={22} />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-[#7847eb] transition">
              <Linkedin size={22} />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} LeetHelper. All rights reserved.
      </div>
    </footer>
  );
}
