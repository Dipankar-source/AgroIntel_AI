import { motion } from "framer-motion";
import { GiSprout, GiElectric, GiCrown } from "react-icons/gi";

/* ─── Plan config with react-icons ─── */
const PLAN_CONFIG = {
  free: {
    label: "Free",
    icon: GiSprout,
    colors: {
      text: "#16a34a",
      trail: [
        "transparent 70%",
        "#16a34a",
        "#4ade80",
        "#16a34a",
        "transparent 100%",
      ],
      glow: ["rgba(22,163,74,0.25)", "rgba(74,222,128,0.15)"],
      shadow: "0 4px 14px rgba(22,163,74,0.25), 0 1px 4px rgba(22,163,74,0.15)",
      shadowHover:
        "0 8px 24px rgba(22,163,74,0.40), 0 2px 8px rgba(22,163,74,0.22)",
      bg: "rgba(255,255,255,0.88)",
      speed: "2.8s",
    },
  },
  premium: {
    label: "Premium",
    icon: GiElectric,
    colors: {
      text: "#0369a1",
      trail: [
        "transparent 65%",
        "#0ea5e9",
        "#38bdf8",
        "#7dd3fc",
        "#0ea5e9",
        "transparent 100%",
      ],
      glow: ["rgba(14,165,233,0.30)", "rgba(56,189,248,0.18)"],
      shadow:
        "0 4px 18px rgba(14,165,233,0.30), 0 1px 6px rgba(14,165,233,0.18)",
      shadowHover:
        "0 8px 28px rgba(14,165,233,0.48), 0 2px 10px rgba(14,165,233,0.26)",
      bg: "rgba(240,249,255,0.92)",
      speed: "2.0s",
    },
  },
  superPremium: {
    label: "Super Premium",
    icon: GiCrown,
    colors: {
      text: "#7c3aed",
      trail: [
        "transparent 55%",
        "#a855f7",
        "#f59e0b",
        "#f97316",
        "#a855f7",
        "transparent 100%",
      ],
      glow: ["rgba(168,85,247,0.35)", "rgba(245,158,11,0.20)"],
      shadow:
        "0 4px 20px rgba(168,85,247,0.32), 0 1px 6px rgba(245,158,11,0.20)",
      shadowHover:
        "0 8px 32px rgba(168,85,247,0.52), 0 2px 12px rgba(245,158,11,0.30)",
      bg: "rgba(250,245,255,0.92)",
      speed: "1.4s",
    },
  },
};

/* ─── Helper to build conic-gradient string ─── */
const buildTrail = (stops) =>
  `conic-gradient(from var(--angle), ${stops.join(", ")})`;

/* ─── Plan Badge Button ─── */
const PlanBadgeButton = ({ userPlan, onClick }) => {
  const config = PLAN_CONFIG[userPlan] ?? PLAN_CONFIG.free;
  const { label, icon: Icon, colors } = config;
  const animId = `trail-${userPlan}`;

  return (
    <motion.button
      onClick={onClick}
      className="relative px-4 py-2 rounded-full text-sm font-medium cursor-pointer hidden sm:inline-flex items-center gap-1.5 overflow-hidden"
      whileHover={{
        scale: 1.06,
        boxShadow: colors.shadowHover,
      }}
      whileTap={{ scale: 0.97 }}
      initial={{ boxShadow: colors.shadow }}
      animate={{ boxShadow: colors.shadow }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      style={{
        background: colors.bg,
        backdropFilter: "blur(10px)",
        color: colors.text,
        boxShadow: colors.shadow,
        border: "none",
        outline: "none",
      }}
    >
      {/* Rotating border trail */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          padding: "1.5px",
          background: buildTrail(colors.trail),
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          animation: `${animId}-rotate ${colors.speed} linear infinite`,
        }}
      />

      {/* Glow halo */}
      <span
        style={{
          position: "absolute",
          inset: "-1px",
          borderRadius: "9999px",
          background: "transparent",
          boxShadow: `0 0 10px 2px ${colors.glow[0]}, 0 0 26px 5px ${colors.glow[1]}`,
          animation: `${animId}-pulse 2.2s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />

      {/* Shimmer sweep for superPremium */}
      {userPlan === "superPremium" && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmerSweep 2.2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Keyframes */}
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes ${animId}-rotate {
          to { --angle: 360deg; }
        }
        @keyframes ${animId}-pulse {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 1; }
        }
        @keyframes shimmerSweep {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* Content with React Icon */}
      <span className="relative z-10 flex items-center gap-1.5 leading-none">
        <Icon size={16} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          {label}
        </span>
      </span>
    </motion.button>
  );
};

export default PlanBadgeButton;
