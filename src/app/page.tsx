import Image from "next/image";
import Navbar from "@/components/section/Navbar";
import Hero from "@/components/section/Hero";
import Benefits from "@/components/section/Benefits";
import Footer from "@/components/section/Footer";
export default function Home() {
  return (
    <div className="">
      <Hero />
      <Benefits />
    </div>
  );
}
