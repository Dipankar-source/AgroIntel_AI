import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CollapsableSidebar from "@/components/CollapsableSidebar";
import Navbar from "@/components/Navbar";
import Weather from "@/components/Weather";
import Hero from "@/components/Hero";
import ConnectedDevices from "@/components/ConnectedDevices";
import ShortAbout from "@/components/ShortAbout";
import Footer from "@/components/Footer";
import QuickAiAssists from "@/components/QuickAiAssists";
import MarketInsights from "@/components/MarketInsights";

function TractorSeparator({ flip = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className="relative w-full h-16 overflow-hidden max-w-5xl mx-auto"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {/* Twin furrow tracks that draw as the tractor moves */}
      {/* <motion.div
        className="absolute bottom-2 left-0 h-1 rounded-full"
        style={{ background: "#16a34a" }} // Green track
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : {}}
        transition={{ duration: 2.2, ease: "linear" }}
      /> */}
      <motion.div
        className="absolute bottom-4 left-0 h-0.5 rounded-full opacity-60"
        style={{ background: "#38b000" }} // Darker green track
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : {}}
        transition={{ duration: 2.2, ease: "linear" }}
      />

      {/* Dust puffs trailing behind */}
      {inView &&
        [0.3, 0.7, 1.1, 1.5, 1.9].map((delay, i) => (
          <motion.div
            key={i}
            className="absolute bottom-4 rounded-full"
            style={{
              width: 6 + i * 2,
              height: 6 + i * 2,
              background: "rgba(180,120,60,0.3)",
              filter: "blur(3px)",
            }}
            initial={{ opacity: 0, scale: 0, x: `${(delay / 2.2) * 100}vw` }}
            animate={{
              x: [`${(delay / 2.2) * 85}%`, `${(delay / 2.2) * 85 - 5}%`],
              opacity: [0, 0.7, 0],
              scale: [0, 1.5, 0],
              y: [0, -10, -20],
            }}
            transition={{ delay, duration: 0.8 }}
          />
        ))}

      {/* Tractor SVG */}
      <motion.div
        className="absolute bottom-3"
        initial={{ left: "-80px" }}
        animate={inView ? { left: "calc(100% + 10px)" } : {}}
        transition={{ duration: 2.2, ease: "linear" }}
      >
        <img src="./logo-brows.png" alt="logo" className="w-12 h-12"/>
      </motion.div>

      {/* Label fades in after tractor exits */}
      {!flip && (
        <motion.div
          className="absolute inset-x-0 top-0 flex items-center justify-center"
          style={flip ? { transform: "scaleX(-1)" } : {}}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 2.4, duration: 0.6 }}
        >
         
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Home Page
───────────────────────────────────────────── */
const Home = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        * { font-family: 'DM Sans', sans-serif; }
        html { scroll-behavior: smooth; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-green-50/60 via-white to-emerald-50/40">
        <main className="pt-16 transition-all duration-300">
          <Hero />

          {/* Tractor plows from left → right */}
          <TractorSeparator />

          <Weather />

          {/* Tractor plows from right → left (flip) */}
          <TractorSeparator flip />

          <ConnectedDevices />

          {/* Tractor plows from left → right again */}
          <TractorSeparator />

          <MarketInsights />
          <TractorSeparator flip/>

          <ShortAbout />
          <QuickAiAssists />
        </main>
      </div>
    </>
  );
};

export default Home;
