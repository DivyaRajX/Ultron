"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUser(data.user);
    };
    loadUser();
  }, []);

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">
          <span className="text-[#7847eb]">Leet</span>Helper
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/features" className="hover:text-white transition">Features</Link>
          <Link href={"/discuss"} className="hover:text-white transition">Discuss Questions</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href={"https://ats-checker-gnxi.onrender.com/"} className="hover:text-white transition">Check your resume</Link>


          {/* LOGIN / USER DROPDOWN */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white">Hi, {user.user_name}</span>
              <Button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push("/sign-in")}
              className="bg-[#7847eb] hover:bg-[#693bd8] text-white rounded-xl px-5 py-2"
            >
              Login
            </Button>
          )}
        </div>

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
          <Link href={"/discuss"} className="hover:text-white transition">Discuss Questions</Link>

          <Link href="/pricing" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white transition">Pricing</Link>
          <Link href="/about" onClick={() => setOpen(false)} className="text-gray-300 hover:text-white transition">About</Link>
          <Link href={"https://ats-checker-gnxi.onrender.com/"}>Check your resume</Link>
          {user ? (
            <>
              <span className="text-white">Hi, {user.user_name}</span>
              <Button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push("/sign-in")} className="bg-[#7847eb] hover:bg-[#693bd8] text-white px-6 py-2">
              Login
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
