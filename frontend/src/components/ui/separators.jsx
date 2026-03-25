import { useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   🚜  SEPARATOR 1: TRACTOR PLOWS A FURROW
   Tractor drives left→right, leaving twin furrow tracks behind it
═══════════════════════════════════════════════════════════════ */
function TractorSeparator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="relative w-full h-16 overflow-hidden">
      {/* Soil bed */}
      <div className="absolute bottom-0 inset-x-0 h-4 rounded-sm"
        style={{ background: "linear-gradient(to bottom, #92400e, #78350f)" }} />

      {/* Furrow lines that grow as tractor passes */}
      <motion.div
        className="absolute bottom-2 left-0 h-1 rounded-full"
        style={{ background: "linear-gradient(to right, #451a03, #713f12)" }}
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : {}}
        transition={{ duration: 2.2, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-4 left-0 h-0.5 rounded-full opacity-60"
        style={{ background: "#451a03" }}
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : {}}
        transition={{ duration: 2.2, ease: "linear" }}
      />

      {/* Dust puff trail */}
      {inView && [0.3, 0.7, 1.1, 1.5, 1.9].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute bottom-4 rounded-full"
          style={{ width: 6 + i * 2, height: 6 + i * 2, background: "rgba(180,120,60,0.3)", filter: "blur(3px)" }}
          initial={{ x: `${(delay / 2.2) * 100}vw`, opacity: 0, scale: 0 }}
          animate={inView ? {
            x: [`${(delay / 2.2) * 85}%`, `${(delay / 2.2) * 85 - 5}%`],
            opacity: [0, 0.7, 0],
            scale: [0, 1.5, 0],
            y: [0, -10, -20],
          } : {}}
          transition={{ delay: delay, duration: 0.8 }}
        />
      ))}

      {/* TRACTOR SVG */}
      <motion.div
        className="absolute bottom-3"
        initial={{ left: "-80px" }}
        animate={inView ? { left: "calc(100% + 10px)" } : {}}
        transition={{ duration: 2.2, ease: "linear" }}
      >
        <svg width="64" height="38" viewBox="0 0 64 38" fill="none">
          {/* rear big wheel */}
          <circle cx="16" cy="28" r="10" fill="#1c1917" stroke="#78350f" strokeWidth="2"/>
          <circle cx="16" cy="28" r="5" fill="#292524"/>
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <line key={i} x1={16+5*Math.cos(a*Math.PI/180)} y1={28+5*Math.sin(a*Math.PI/180)}
              x2={16+9.5*Math.cos(a*Math.PI/180)} y2={28+9.5*Math.sin(a*Math.PI/180)}
              stroke="#78350f" strokeWidth="1.5"/>
          ))}
          {/* front small wheel */}
          <circle cx="50" cy="30" r="6" fill="#1c1917" stroke="#78350f" strokeWidth="1.5"/>
          <circle cx="50" cy="30" r="3" fill="#292524"/>
          {/* body */}
          <rect x="18" y="12" width="32" height="16" rx="2" fill="#15803d"/>
          <rect x="22" y="8" width="14" height="10" rx="2" fill="#166534"/>
          {/* cabin window */}
          <rect x="24" y="10" width="10" height="7" rx="1" fill="#bef264" opacity="0.8"/>
          {/* exhaust pipe */}
          <rect x="17" y="5" width="3" height="10" rx="1" fill="#374151"/>
          {/* exhaust puff */}
          {inView && (
            <motion.circle cx="18" cy="3" r="3" fill="#9ca3af" opacity="0.5"
              animate={{ r:[2,5,2], opacity:[0.6,0,0.6], cy:[3,0,3] }}
              transition={{ repeat:Infinity, duration:0.8 }}
            />
          )}
          {/* plow blade at back */}
          <path d="M4 30 L0 34 L8 34 Z" fill="#6b7280"/>
          <line x1="4" y1="20" x2="4" y2="30" stroke="#6b7280" strokeWidth="2"/>
        </svg>
      </motion.div>

      {/* Label that fades in after tractor passes */}
      <motion.div
        className="absolute inset-x-0 top-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.4, duration: 0.6 }}
      >
        <span style={{ fontFamily:"Georgia,serif", fontSize:10, letterSpacing:"0.25em", color:"#92400e", textTransform:"uppercase" }}>
          ✦ Fresh Ground ✦
        </span>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   🌾  SEPARATOR 2: WHEAT FIELD GROWS FROM CENTER
   Wheat stalks sprout from the ground line outward
═══════════════════════════════════════════════════════════════ */
function WheatSeparator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const stalks = Array.from({ length: 22 }, (_, i) => ({
    x: (i / 21) * 100,
    height: 18 + Math.sin(i * 1.3) * 6,
    lean: (Math.random() - 0.5) * 8,
    delay: Math.abs(i - 10) * 0.06,
  }));

  return (
    <div ref={ref} className="relative w-full h-14 overflow-hidden">
      {/* Ground line */}
      <motion.div
        className="absolute bottom-0 inset-x-0 h-0.5 rounded"
        style={{ background: "linear-gradient(to right, transparent, #a16207, #ca8a04, #a16207, transparent)" }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.5 }}
      />

      {/* SVG stalks */}
      <svg className="absolute bottom-0 w-full" height="56" viewBox="0 0 440 56" preserveAspectRatio="none">
        {stalks.map((s, i) => {
          const cx = (s.x / 100) * 440;
          const lean = s.lean;
          const h = s.height;
          return (
            <g key={i}>
              {/* stalk */}
              <motion.line
                x1={cx} y1={56}
                x2={cx + lean} y2={56 - h}
                stroke="#a16207"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: s.delay, duration: 0.5 }}
              />
              {/* wheat head */}
              <motion.ellipse
                cx={cx + lean} cy={56 - h - 5}
                rx="2.5" ry="5"
                fill="#ca8a04"
                transform={`rotate(${lean * 2}, ${cx + lean}, ${56 - h - 5})`}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={inView ? { scaleY: 1, opacity: 1 } : {}}
                transition={{ delay: s.delay + 0.4, duration: 0.4 }}
              />
              {/* awns (bristles) */}
              {[-1, 0, 1].map((k, j) => (
                <motion.line key={j}
                  x1={cx + lean + k * 2.5} y1={56 - h - 4 + k}
                  x2={cx + lean + k * 4} y2={56 - h - 10 + k * 0.5}
                  stroke="#fbbf24"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 0.9 } : {}}
                  transition={{ delay: s.delay + 0.6, duration: 0.3 }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Wind sway after grow */}
      {inView && (
        <motion.div
          className="absolute inset-0"
          animate={{ skewX: [0, 1, -1, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }}
          style={{ transformOrigin: "bottom center" }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   🌱  SEPARATOR 3: SEED DROP & SPROUT LINE
   Seeds drop one by one, each sprouts into a tiny plant
═══════════════════════════════════════════════════════════════ */
function SeedSeparator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const seeds = Array.from({ length: 14 }, (_, i) => ({
    x: 4 + (i / 13) * 92,
    delay: i * 0.12,
  }));

  return (
    <div ref={ref} className="relative w-full h-16 overflow-hidden">
      {/* soil line */}
      <div className="absolute bottom-3 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, #92400e 10%, #92400e 90%, transparent)" }} />

      {seeds.map((s, i) => (
        <div key={i} className="absolute" style={{ left: `${s.x}%`, bottom: "12px" }}>
          {/* falling seed */}
          <motion.div
            className="absolute -translate-x-1/2"
            style={{ width: 6, height: 8, background: "#d97706", borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", bottom: 0 }}
            initial={{ y: -40, opacity: 0, rotate: -20 }}
            animate={inView ? { y: 0, opacity: [0, 1, 1, 0], rotate: 0 } : {}}
            transition={{ delay: s.delay, duration: 0.5, times: [0, 0.3, 0.7, 1] }}
          />
          {/* sprout stem */}
          <motion.div
            className="absolute -translate-x-1/2 rounded-full"
            style={{ width: 1.5, background: "#16a34a", bottom: 0, transformOrigin: "bottom" }}
            initial={{ height: 0, opacity: 0 }}
            animate={inView ? { height: 14, opacity: 1 } : {}}
            transition={{ delay: s.delay + 0.55, duration: 0.4, ease: "easeOut" }}
          />
          {/* left leaf */}
          <motion.div
            className="absolute"
            style={{ width: 7, height: 4, background: "#22c55e", borderRadius: "0 50% 50% 0", bottom: 8, left: "calc(-50% - 6px)", transformOrigin: "right center" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={inView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ delay: s.delay + 0.9, duration: 0.3 }}
          />
          {/* right leaf */}
          <motion.div
            className="absolute"
            style={{ width: 7, height: 4, background: "#16a34a", borderRadius: "50% 0 0 50%", bottom: 10, left: "calc(-50% + 1px)", transformOrigin: "left center" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={inView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ delay: s.delay + 1.0, duration: 0.3 }}
          />
        </div>
      ))}

      {/* text */}
      <motion.p
        className="absolute inset-x-0 top-0 text-center"
        style={{ fontFamily: "Georgia, serif", fontSize: 9, letterSpacing: "0.3em", color: "#a16207", textTransform: "uppercase" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        — Sow · Grow · Harvest —
      </motion.p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   🌻  SEPARATOR 4: SUNFLOWER FENCE ROW
   A wooden fence post with climbing vines + a sunflower blooms
═══════════════════════════════════════════════════════════════ */
function FenceSeparator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const posts = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div ref={ref} className="relative w-full h-20 overflow-hidden">
      {/* Rails */}
      <motion.div className="absolute inset-x-0" style={{ top: "28%", height: 3, background: "#92400e", borderRadius: 2 }}
        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 0.8 }} style2={{ originX: 0 }} />
      <motion.div className="absolute inset-x-0" style={{ top: "52%", height: 3, background: "#78350f", borderRadius: 2 }}
        initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 0.8, delay: 0.1 }} style2={{ originX: 0 }} />

      {/* Posts */}
      {posts.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${(i / 8) * 96 + 2}%`, top: "15%", width: "2.5%", height: "70%", background: "linear-gradient(to right, #92400e, #a16207, #92400e)", borderRadius: "2px 2px 0 0" }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={inView ? { scaleY: 1, opacity: 1 } : {}}
          transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: "easeOut" }}
          style2={{ transformOrigin: "bottom" }}
        />
      ))}

      {/* Sunflower in center */}
      <motion.div
        className="absolute"
        style={{ left: "49%", top: 0, transform: "translateX(-50%)" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 1.1, duration: 0.7, type: "spring", bounce: 0.5 }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          {/* petals */}
          {Array.from({length:8},(_,i)=>(
            <ellipse key={i} cx={16} cy={6} rx={3} ry={5} fill="#fbbf24"
              transform={`rotate(${i*45}, 16, 16)`} opacity="0.9"/>
          ))}
          {/* center */}
          <circle cx={16} cy={16} r={6} fill="#92400e"/>
          <circle cx={16} cy={16} r={4} fill="#78350f"/>
          {/* seeds pattern */}
          {[0,60,120,180,240,300].map((a,i)=>(
            <circle key={i} cx={16+2.2*Math.cos(a*Math.PI/180)} cy={16+2.2*Math.sin(a*Math.PI/180)} r={0.8} fill="#451a03"/>
          ))}
          {/* stem */}
          <line x1={16} y1={22} x2={16} y2={32} stroke="#15803d" strokeWidth={2.5} strokeLinecap="round"/>
          <path d="M16 27 Q10 24 9 20" stroke="#15803d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </motion.div>

      {/* vine tendrils on fence rail */}
      {inView && (
        <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }}>
          <motion.path d="M40,40 Q80,30 120,42 Q160,52 200,40 Q240,28 280,42 Q320,54 360,40"
            fill="none" stroke="#15803d" strokeWidth="1.2" opacity="0.6" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1.5 }}/>
        </motion.svg>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   🌧️  SEPARATOR 5: IRRIGATION / RAIN DROPS ON EARTH
   Water drops fall, hit ground, and ripple
═══════════════════════════════════════════════════════════════ */
function RainSeparator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (!inView) return;
    const drops = Array.from({ length: 18 }, (_, i) => i);
    drops.forEach((i) => {
      setTimeout(() => {
        setRipples(r => [...r, { id: i, x: 4 + (i / 17) * 92 }]);
      }, i * 100 + 200);
    });
  }, [inView]);

  return (
    <div ref={ref} className="relative w-full h-14 overflow-hidden">
      {/* Ground */}
      <div className="absolute bottom-0 inset-x-0 h-3 rounded"
        style={{ background: "linear-gradient(to bottom, #92400e, #78350f)" }} />

      {/* Raindrops falling */}
      {ripples.map((r) => (
        <div key={r.id} className="absolute" style={{ left: `${r.x}%` }}>
          <motion.div
            className="absolute -translate-x-1/2"
            style={{ width: 2, height: 8, background: "#60a5fa", borderRadius: 99, bottom: 12 }}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.4, ease: "easeIn" }}
          />
          {/* ripple ring */}
          <motion.div
            className="absolute -translate-x-1/2 rounded-full border border-blue-400"
            style={{ bottom: 10 }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 18, height: 6, opacity: 0, marginLeft: -9 }}
            transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
          />
        </div>
      ))}

      {/* Mud splash text */}
      <motion.p
        className="absolute inset-x-0 top-1 text-center"
        style={{ fontFamily: "Georgia,serif", fontSize: 9, letterSpacing: "0.3em", color: "#3b82f6", textTransform: "uppercase" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        ≋ Water Is Life ≋
      </motion.p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   🍂  SEPARATOR 6: HARVEST SCYTHE SWIPE
   A scythe sweeps across, leaving cut wheat stalks
═══════════════════════════════════════════════════════════════ */
function ScytheSeparator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="relative w-full h-16 overflow-hidden">
      {/* Cut stubble — grows as scythe passes */}
      <div className="absolute bottom-2 inset-x-0 flex items-end justify-around">
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            style={{ width: 2, background: "#a16207", borderRadius: "1px 1px 0 0", height: 6 + Math.random() * 6 }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={inView ? { scaleY: 1, opacity: 0.7 } : {}}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.2 }}
          />
        ))}
      </div>

      {/* Scythe SVG traveling across */}
      <motion.div
        className="absolute bottom-0"
        initial={{ x: "-80px" }}
        animate={inView ? { x: "calc(100vw + 60px)" } : {}}
        transition={{ duration: 2, ease: "linear" }}
      >
        <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
          {/* handle */}
          <line x1="30" y1="5" x2="30" y2="45" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/>
          {/* blade arc */}
          <path d="M30 15 Q8 20 5 40 Q20 28 30 32" fill="#6b7280" stroke="#374151" strokeWidth="1"/>
          {/* blade shine */}
          <path d="M30 16 Q12 21 9 38" fill="none" stroke="#d1d5db" strokeWidth="0.8" opacity="0.7"/>
          {/* motion blur streak */}
          <motion.line x1="0" y1="30" x2="-20" y2="32" stroke="#fbbf24" strokeWidth="1" opacity="0.4"
            animate={{ opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 0.3 }}/>
        </svg>
      </motion.div>

      {/* Flying wheat snippets */}
      {inView && Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: 10, height: 2, background: "#ca8a04", borderRadius: 1, bottom: 12 + i * 2, left: `${10 + i * 10}%` }}
          initial={{ opacity: 0, y: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], y: [-10, -25], rotate: [0, 40 * (i % 2 === 0 ? 1 : -1)] }}
          transition={{ delay: 0.2 + i * 0.18, duration: 0.6 }}
        />
      ))}

      <motion.p
        className="absolute inset-x-0 top-0 text-center"
        style={{ fontFamily: "Georgia,serif", fontSize: 9, letterSpacing: "0.3em", color: "#d97706", textTransform: "uppercase" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 2.3, duration: 0.6 }}
      >
        — Harvest Season —
      </motion.p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   🐛  SHOWCASE
═══════════════════════════════════════════════════════════════ */
const demoSections = [
  {
    label: "🚜 Tractor Furrow",
    sub: "Tractor drives across plowing twin soil tracks",
    comp: <TractorSeparator />,
    bg: "from-amber-950/40 to-stone-900/40",
  },
  {
    label: "🌾 Wheat Field",
    sub: "Stalks sprout from center outward, sway in wind",
    comp: <WheatSeparator />,
    bg: "from-yellow-950/40 to-stone-900/40",
  },
  {
    label: "🌱 Seed Drop",
    sub: "Seeds fall, hit soil, each sprouts a tiny plant",
    comp: <SeedSeparator />,
    bg: "from-green-950/40 to-stone-900/40",
  },
  {
    label: "🌻 Farm Fence",
    sub: "Wooden fence posts with vines and a blooming sunflower",
    comp: <FenceSeparator />,
    bg: "from-orange-950/40 to-stone-900/40",
  },
  {
    label: "🌧️ Irrigation Rain",
    sub: "Water drops fall and ripple on the earth",
    comp: <RainSeparator />,
    bg: "from-sky-950/40 to-stone-900/40",
  },
  {
    label: "🍂 Scythe Harvest",
    sub: "Scythe sweeps across leaving stubble and flying wheat",
    comp: <ScytheSeparator />,
    bg: "from-red-950/30 to-stone-900/40",
  },
];

export default function AgriSeparators() {
  return (
    <div className="min-h-screen py-16 px-6" style={{ background: "#0d0a07", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Header */}
      <motion.div
        className="text-center mb-16 max-w-xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <div className="text-4xl mb-3">🌾</div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#fbbf24", letterSpacing: "-0.01em", textShadow: "0 2px 20px rgba(251,191,36,0.3)" }}>
          Field Separators
        </h1>
        <p className="text-sm" style={{ color: "#a16207", letterSpacing: "0.25em", textTransform: "uppercase" }}>
          Agriculture · Scroll to Sow
        </p>
      </motion.div>

      {/* Cards */}
      <div className="max-w-2xl mx-auto space-y-8">
        {demoSections.map((s, i) => (
          <motion.div
            key={s.label}
            className={`relative rounded-2xl overflow-hidden border bg-gradient-to-br ${s.bg}`}
            style={{ borderColor: "rgba(161,98,7,0.2)" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            {/* card inner */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-1">
                <h2 className="font-bold text-sm" style={{ color: "#fef3c7", letterSpacing: "0.05em" }}>{s.label}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(161,98,7,0.25)", color: "#fbbf24", letterSpacing: "0.05em" }}>
                  scroll-triggered
                </span>
              </div>
              <p className="text-xs mb-5" style={{ color: "#78716c" }}>{s.sub}</p>

              {/* The separator itself */}
              <div className="relative rounded-lg px-2 py-2" style={{ background: "rgba(0,0,0,0.3)" }}>
                {s.comp}
              </div>
            </div>

            {/* decorative soil stripe at bottom */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #451a03, #92400e, #d97706, #92400e, #451a03)" }} />
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center mt-16 text-xs"
        style={{ color: "#57534e", letterSpacing: "0.3em", textTransform: "uppercase" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        🌱 Root Deep · Grow Tall 🌱
      </motion.p>
    </div>
  );
}