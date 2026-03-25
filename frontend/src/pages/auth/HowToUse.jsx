import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import {
  Sprout,
  UploadCloud,
  BarChart2,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Step data ─── */
const STEPS = [
  {
    id: 0,
    icon: Sprout,
    accent: "#16a34a",
    accentLight: "rgba(22,163,74,0.10)",
    tag: "Welcome",
    title: "Your farm,\nnow intelligent.",
    desc: "AgroIntel uses AI to turn raw farm data into clear, actionable decisions — from soil health to harvest timing. Let's walk you through how it works.",
    lottiePath: "/lottie/plant-scanning.json",
  },
  {
    id: 1,
    icon: UploadCloud,
    accent: "#059669",
    accentLight: "rgba(5,150,105,0.10)",
    tag: "Step 1",
    title: "Upload your\nsoil reports.",
    desc: "Drag and drop your soil test PDFs or lab reports. AgroIntel reads NPK levels, pH, moisture, and organic matter to build your land's profile instantly.",
    lottiePath: "/lottie/excel-upload.json",
  },
  {
    id: 2,
    icon: BarChart2,
    accent: "#0d9488",
    accentLight: "rgba(13,148,136,0.10)",
    tag: "Step 2",
    title: "Get AI-powered\ninsights.",
    desc: "Our model cross-references your soil data with local climate, crop market prices, and seasonal patterns to recommend what to grow and when.",
    lottiePath: "/lottie/graph.json",
  },
  {
    id: 3,
    icon: CalendarDays,
    accent: "#16a34a",
    accentLight: "rgba(22,163,74,0.10)",
    tag: "Step 3",
    title: "Plan your\nseason smartly.",
    desc: "Receive a personalised planting calendar — sowing windows, irrigation schedules, and fertilisation timelines tailored to your exact land and crops.",
    lottiePath: "/lottie/time.json",
  },
  {
    id: 4,
    icon: ShieldCheck,
    accent: "#15803d",
    accentLight: "rgba(21,128,61,0.10)",
    tag: "You're all set",
    title: "Your data,\nalways private.",
    desc: "Every byte of your farm data is encrypted and belongs only to you. We never sell, share, or train on your data without explicit consent.",
    lottiePath: "/lottie/shield.json",
  },
];

/* ─── Lottie Visual component with dynamic import ─── */
const LottieVisual = ({ lottiePath, accent }) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const lottieRef = useRef();

  useEffect(() => {
    setLoading(true);
    // Dynamically import the JSON file
    fetch(lottiePath)
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading Lottie animation:", error);
        setLoading(false);
      });
  }, [lottiePath]);

  if (loading) {
    return (
      <div className="w-48 h-40 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!animationData) {
    return (
      <div className="w-48 h-40 flex items-center justify-center text-gray-400">
        <span>Failed to load animation</span>
      </div>
    );
  }

  return (
    <div className="w-48 h-40 flex items-center justify-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
    </div>
  );
};

/* ─── Progress dots ─── */
const ProgressDots = ({ total, current, accent }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          width: i === current ? 24 : 8,
          backgroundColor: i <= current ? accent : "#d1d5db",
          opacity: i < current ? 0.45 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-2 rounded-full"
      />
    ))}
  </div>
);

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const HowToUse = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const go = (dir) => {
    setDirection(dir);
    setStep((s) => s + dir);
  };

  const finish = () => navigate("/");

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm        { font-family: 'DM Sans', sans-serif; }
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-10">
        {/* ── Blur blobs — colour-keyed to step accent ── */}
        <motion.div
          key={`blob-tl-${step}`}
          animate={{ backgroundColor: current.accent, opacity: 0.18 }}
          transition={{ duration: 0.9 }}
          className="absolute w-80 h-80 rounded-full blur-[110px] -top-20 -left-20 pointer-events-none"
        />
        <motion.div
          key={`blob-br-${step}`}
          animate={{ backgroundColor: current.accent, opacity: 0.13 }}
          transition={{ duration: 1.1, delay: 0.1 }}
          className="absolute w-72 h-72 rounded-full blur-[90px] -bottom-16 -right-16 pointer-events-none"
        />

        {/* ── Card ── */}
        <div className="relative w-full max-w-[420px]">
          {/* Skip button */}
          <div className="flex justify-end mb-3">
            <button
              onClick={finish}
              className="font-dm text-[12px] text-gray-400 hover:text-gray-600
                         transition-colors px-3 py-1 rounded-full
                         hover:bg-white/70 border border-transparent hover:border-gray-200"
            >
              Skip all
            </button>
          </div>

          <motion.div
            layout
            className="bg-white rounded-[24px] border border-gray-100
                       shadow-[0_8px_40px_rgba(16,185,129,0.10)] overflow-hidden"
          >
            {/* ── Illustration panel ── */}
            <motion.div
              key={`panel-${step}`}
              animate={{ backgroundColor: current.accentLight }}
              transition={{ duration: 0.6 }}
              className="relative px-10 pt-10 pb-6 flex justify-center"
            >
              {/* tag pill */}
              <motion.div
                key={`tag-${step}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-4 left-5"
              >
                <span
                  className="font-dm text-[10px] uppercase tracking-[0.18em] font-medium px-3 py-1 rounded-full"
                  style={{
                    color: current.accent,
                    backgroundColor: current.accentLight,
                    border: `1px solid ${current.accent}30`,
                  }}
                >
                  {current.tag}
                </span>
              </motion.div>

              {/* Lottie Animation */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`lottie-${step}`}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <LottieVisual
                    lottiePath={current.lottiePath}
                    accent={current.accent}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* ── Text + controls ── */}
            <div className="px-7 pb-8 pt-5">
              {/* Title */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.h2
                  key={`title-${step}`}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="font-cormorant text-[2rem] font-bold text-gray-800
                             leading-[1.08] tracking-tight mb-3 whitespace-pre-line"
                >
                  {current.title}
                </motion.h2>
              </AnimatePresence>

              {/* Desc */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.p
                  key={`desc-${step}`}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.38,
                    delay: 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="font-dm font-light text-gray-500 text-[13.5px] leading-relaxed mb-7"
                >
                  {current.desc}
                </motion.p>
              </AnimatePresence>

              {/* Progress + nav */}
              <div className="flex items-center justify-between">
                <ProgressDots
                  total={STEPS.length}
                  current={step}
                  accent={current.accent}
                />

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <motion.button
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => go(-1)}
                      className="font-dm text-[12.5px] text-gray-400
                                 hover:text-gray-600 transition-colors px-3 py-2"
                    >
                      Back
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={isLast ? finish : () => go(1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-[12px]
                               font-dm font-medium text-[13.5px] text-white
                               transition-shadow duration-200 cursor-pointer border-none"
                    style={{
                      background: `linear-gradient(135deg, ${current.accent}, ${current.accent}cc)`,
                      boxShadow: `0 4px 16px ${current.accent}40`,
                    }}
                  >
                    {isLast ? "Get started" : "Next"}
                    {isLast ? (
                      <ArrowRight size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step counter hint */}
          <p className="text-center font-dm text-[11px] text-gray-300 mt-4 tracking-wide">
            {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>
    </>
  );
};

export default HowToUse;
