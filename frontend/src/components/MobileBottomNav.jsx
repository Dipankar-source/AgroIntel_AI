import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Home, FlaskConical, Sprout, Store, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { href: "/", icon: Home },
  { href: "/soil", icon: FlaskConical },
  { href: "/planner", icon: Sprout, center: true },
  { href: "/market", icon: Store },
  { href: "/profile", icon: User },
];

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  const on = (h) => (h === "/" ? pathname === "/" : pathname.startsWith(h));

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      if (y < 10) setVisible(true);
      else if (y > lastY.current + 5) setVisible(false);
      else if (y < lastY.current - 5) setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  /* ── Bar & notch geometry ── */
  const FAB_SIZE = 54;
  const BAR_H = 64;
  const BAR_W = 340;
  const midX = BAR_W / 2;
  const r = 22;
  const nr = FAB_SIZE / 2 + 6;
  const nd = 8;

  const notchPath = `
    M${r},0
    L${midX - nr - 16},0
    C${midX - nr - 4},0 ${midX - nr},${nd} ${midX},${nd}
    C${midX + nr},${nd} ${midX + nr + 4},0 ${midX + nr + 16},0
    L${BAR_W - r},0
    Q${BAR_W},0 ${BAR_W},${r}
    L${BAR_W},${BAR_H - r}
    Q${BAR_W},${BAR_H} ${BAR_W - r},${BAR_H}
    L${r},${BAR_H}
    Q0,${BAR_H} 0,${BAR_H - r}
    L0,${r}
    Q0,0 ${r},0 Z`;

  /* ── Theme-aware colours ── */
  const barFill = dark ? "rgba(17,17,19,0.92)" : "rgba(255,255,255,0.92)";
  const barStroke = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const barShadow = dark
    ? "drop-shadow(0 8px 32px rgba(0,0,0,0.45)) drop-shadow(0 1.5px 4px rgba(0,0,0,0.25))"
    : "drop-shadow(0 8px 32px rgba(0,0,0,0.10)) drop-shadow(0 1.5px 4px rgba(0,0,0,0.06))";

  const fabGrad = "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #059669 100%)";
  const fabShadow = dark
    ? "0 6px 24px -2px rgba(22,163,74,0.55), 0 2px 8px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
    : "0 6px 24px -2px rgba(22,163,74,0.45), 0 2px 8px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.25)";
  const glowColor = dark
    ? "radial-gradient(circle, rgba(34,197,94,0.35) 0%, transparent 70%)"
    : "radial-gradient(circle, rgba(22,163,74,0.35) 0%, transparent 70%)";

  const activeColor = dark ? "#4ade80" : "#16a34a";
  const inactiveColor = dark ? "rgba(156,163,175,0.5)" : "rgba(156,163,175,0.9)";
  const dotGrad = dark
    ? "linear-gradient(90deg, #4ade80, #22c55e)"
    : "linear-gradient(90deg, #22c55e, #16a34a)";

  return (
    <div className="md:hidden fixed inset-0 flex items-end justify-center pb-2 pointer-events-none z-50">
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative pointer-events-auto"
        style={{ width: BAR_W }}
      >
        {/* SVG-shaped bar with notch */}
        <svg
          width={BAR_W}
          height={BAR_H}
          className="absolute inset-0"
          style={{ filter: barShadow, overflow: "visible" }}
        >
          <path d={notchPath} fill={barFill} />
          <path d={notchPath} fill="none" stroke={barStroke} strokeWidth="0.5" />
          {/* Top edge highlight */}
          <line
            x1={r + 8}
            y1="0.5"
            x2={midX - nr - 20}
            y2="0.5"
            stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)"}
            strokeWidth="0.8"
          />
          <line
            x1={midX + nr + 20}
            y1="0.5"
            x2={BAR_W - r - 8}
            y2="0.5"
            stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)"}
            strokeWidth="0.8"
          />
        </svg>

        {/* Nav items row */}
        <div
          className="relative"
          style={{
            height: BAR_H,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 72px 1fr 1fr",
          }}
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            const isOn = on(item.href);

            /* ── Center FAB ── */
            if (item.center) {
              return (
                <div
                  key={item.href}
                  className="relative flex items-center justify-center"
                >
                  <motion.button
                    onClick={() => navigate(item.href)}
                    whileTap={{ scale: 0.88 }}
                    className="outline-none cursor-pointer select-none absolute flex items-center justify-center"
                    style={{
                      top: -FAB_SIZE / 2 + 19,
                      bottom: 0,
                      width: FAB_SIZE,
                      height: FAB_SIZE,
                      borderRadius: "50%",
                      background: fabGrad,
                      boxShadow: fabShadow,
                    }}
                  >
                    <Icon size={22} strokeWidth={2.2} color="white" />
                  </motion.button>
                </div>
              );
            }

            /* ── Regular items ── */
            return (
              <motion.button
                key={item.href}
                onClick={() => navigate(item.href)}
                whileTap={{ scale: 0.82 }}
                className="relative flex flex-col items-center justify-center gap-1
                           outline-none cursor-pointer select-none"
              >
                <motion.div
                  animate={{ scale: isOn ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isOn ? 2.1 : 1.5}
                    style={{
                      color: isOn ? activeColor : inactiveColor,
                      transition: "color 0.25s",
                    }}
                  />
                </motion.div>

                {/* Active dot */}
                <motion.div
                  animate={{ scale: isOn ? 1 : 0, opacity: isOn ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    flexShrink: 0,
                    background: dotGrad,
                  }}
                />
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
};

export default MobileBottomNav;
