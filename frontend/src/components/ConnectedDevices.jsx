import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Settings,
  ArrowUpRight,
  Zap,
  MoreHorizontal,
  Lock,
  LogIn,
  Eye,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const navigateToLogin = () => {
  window.location.href = "/login";
};

const getDevices = (t) => [
  {
    id: 1,
    name: t("devices.soilSensorA"),
    location: "Plot A · North Field",
    status: "online",
    icon: Droplets,
    accent: "#3b82f6",
    accentLight: "rgba(59,130,246,0.08)",
    metrics: [
      { label: t("devices.moisture"), value: "68%", trend: "+2%" },
      { label: t("devices.phLevel"), value: "6.4", trend: "stable" },
      { label: "N-P-K", value: "Good", trend: null },
    ],
    battery: 87,
    signal: 92,
    lastSync: "2m ago",
  },
  {
    id: 2,
    name: t("devices.tempMonitor"),
    location: "Plot B · East Field",
    status: "online",
    icon: Thermometer,
    accent: "#f97316",
    accentLight: "rgba(249,115,22,0.08)",
    metrics: [
      { label: t("devices.airTemp"), value: "29°C", trend: "+1°" },
      { label: t("devices.soilTemp"), value: "24°C", trend: "stable" },
      { label: t("devices.dewPoint"), value: "19°C", trend: "-1°" },
    ],
    battery: 62,
    signal: 78,
    lastSync: "1m ago",
  },
  {
    id: 3,
    name: t("devices.weatherStation"),
    location: "Main Farm",
    status: "online",
    icon: Wind,
    accent: "#14b8a6",
    accentLight: "rgba(20,184,166,0.08)",
    metrics: [
      { label: "Wind", value: "14 km/h", trend: "+3" },
      { label: "Humidity", value: "72%", trend: "+5%" },
      { label: "Pressure", value: "1012 hPa", trend: "stable" },
    ],
    battery: 94,
    signal: 88,
    lastSync: "30s ago",
  },
  {
    id: 4,
    name: t("devices.lightSensor"),
    location: "Greenhouse",
    status: "offline",
    icon: Sun,
    accent: "#eab308",
    accentLight: "rgba(234,179,8,0.06)",
    metrics: [
      { label: "PAR", value: "—", trend: null },
      { label: "Lux", value: "—", trend: null },
      { label: "UV Index", value: "—", trend: null },
    ],
    battery: 12,
    signal: 0,
    lastSync: "3h ago",
  },
];

const SignalDots = ({ level, accent }) => {
  const bars = 4;
  const filled = Math.round((level / 100) * bars);
  return (
    <div className="flex items-end gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-[1px] transition-colors duration-300"
          style={{
            height: `${6 + i * 2}px`,
            backgroundColor: i < filled ? accent : "rgba(0,0,0,0.1)",
          }}
        />
      ))}
    </div>
  );
};

const BatteryIndicator = ({ level, accent }) => {
  const { n } = useLanguage();
  const color = level > 50 ? accent : level > 20 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center w-7 h-3 border border-black/15 dark:border-white/20 rounded-[3px] p-[1.5px]">
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-[2.5px] h-[5px] bg-black/15 dark:bg-white/20 rounded-r-[1px]" />
        <div
          className="h-full rounded-[1.5px] transition-all duration-600"
          style={{ width: `${level}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[10px] font-mono font-medium tracking-wider"
        style={{ color }}
      >
        {n(level)}%
      </span>
    </div>
  );
};

/* ─── Guest locked metric pill ─── */
const LockedValue = () => (
  <div className="flex items-center gap-1">
    <Lock size={10} className="text-slate-300" />
    <span className="text-slate-300 font-mono text-sm font-bold tracking-tight">
      ••••
    </span>
  </div>
);

/* ─── Device Card ─── */
const DeviceCard = ({ device, index, isLoggedIn, t }) => {
  const { n } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [hovered, setHovered] = useState(false);
  const {
    name,
    location,
    status,
    icon: Icon,
    accent,
    accentLight,
    metrics,
    battery,
    signal,
    lastSync,
  } = device;
  const online = status === "online";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white dark:bg-gray-800/90 rounded-2xl border border-black/7 dark:border-white/10 overflow-hidden relative font-sans transition-all duration-350"
      style={{
        boxShadow: hovered
          ? isDark
            ? `0 16px 48px rgba(0,0,0,0.30), 0 0 0 1px ${accent}40`
            : `0 16px 48px rgba(0,0,0,0.10), 0 0 0 1px ${accent}30`
          : isDark
            ? "0 2px 16px rgba(0,0,0,0.20)"
            : "0 2px 16px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Top accent stripe */}
      <div
        className="h-[3px] transition-colors duration-400"
        style={{
          background: online
            ? `linear-gradient(90deg, ${accent}, ${accent}80)`
            : "linear-gradient(90deg, #d1d5db, #e5e7eb)",
        }}
      />

      {/* ── Header ── */}
      <div className="p-4 pb-3.5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Icon
              size={18}
              style={{ color: online ? accent : "#9ca3af" }}
              strokeWidth={1.8}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight leading-tight">
              {name}
            </div>
            <div className="text-[11px] text-gray-400 dark:text-gray-300 mt-0.5 tracking-wide">
              {location}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full border"
              style={{
                background: online
                  ? "rgba(16,185,129,0.08)"
                  : "rgba(0,0,0,0.05)",
                borderColor: online
                  ? "rgba(16,185,129,0.2)"
                  : "rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="w-[5px] h-[5px] rounded-full"
                style={{
                  background: online ? "#10b981" : "#9ca3af",
                  animation: online ? "pulse-dot 2s ease infinite" : "none",
                }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: online ? "#10b981" : "#9ca3af" }}
              >
                {online ? t("devices.online") : t("devices.offline")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border bg-slate-50 border-slate-200">
              <Lock size={8} className="text-slate-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {t("devices.locked")}
              </span>
            </div>
          )}
          <button className="w-6 h-6 rounded-lg border border-dashed border-black/10 dark:border-white/15 bg-transparent flex items-center justify-center cursor-pointer text-gray-400 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-3 border-b border-dashed border-black/8 dark:border-white/10">
        {metrics.map(({ label, value, trend }, i) => (
          <div
            key={label}
            className="p-3.5 pb-3 relative"
            style={{
              borderRight:
                i < metrics.length - 1
                  ? "1.5px dashed rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            {isLoggedIn ? (
              <div
                className="text-base font-bold font-mono tracking-tight leading-tight"
                style={{ color: online ? (isDark ? "#ffffff" : "#111827") : "#9ca3af" }}
              >
                {n(value)}
              </div>
            ) : (
              <LockedValue />
            )}
            <div className="text-[9.5px] text-gray-400 dark:text-gray-300 mt-1 uppercase tracking-wider font-medium">
              {label}
            </div>
            {isLoggedIn && trend && trend !== "stable" && online && (
              <div
                className="absolute top-2 right-2 text-[9px] font-semibold font-mono"
                style={{ color: accent }}
              >
                {n(trend)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Battery + Signal ── */}
      <div className="p-3 pb-2.5 border-b border-dashed border-black/8 dark:border-white/10 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-300 font-semibold">
            {t("devices.battery")}
          </span>
          {isLoggedIn ? (
            <BatteryIndicator level={battery} accent={accent} />
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <Lock size={9} className="text-slate-300" />
              <span className="text-[10px] text-slate-300 font-mono">——</span>
            </div>
          )}
        </div>
        <div className="w-[1.5px] h-7 bg-black/7 dark:bg-white/10 border-dashed" />
        <div className="flex flex-col gap-0.5 items-center">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-300 font-semibold">
            {t("devices.signal")}
          </span>
          {isLoggedIn ? (
            <SignalDots level={signal} accent={accent} />
          ) : (
            <div className="flex items-end gap-[2px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-[1px]"
                  style={{
                    height: `${6 + i * 2}px`,
                    backgroundColor: "rgba(0,0,0,0.07)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="w-[1.5px] h-7 bg-black/7 dark:bg-white/10" />
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-300 font-semibold">
            {t("devices.lastSync")}
          </span>
          <span className="text-[11px] font-mono text-gray-700 dark:text-white font-medium">
            {isLoggedIn ? lastSync : "——"}
          </span>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2">
        <button
          className="py-2.5 border-r border-dashed border-black/8 dark:border-white/10 bg-transparent flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wide font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: isLoggedIn && online ? (isDark ? "#e5e7eb" : "#374151") : "#9ca3af" }}
          disabled={!isLoggedIn || !online}
        >
          <Activity
            size={12}
            style={{ color: isLoggedIn && online ? accent : "#9ca3af" }}
          />
          {t("common.liveData")}
        </button>
        <button
          className="py-2.5 bg-transparent flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wide font-sans transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: isLoggedIn ? (isDark ? "#e5e7eb" : "#374151") : "#9ca3af" }}
          disabled={!isLoggedIn}
        >
          {isLoggedIn ? (
            <>
              <Settings size={12} className="text-gray-400" />
              {t("common.configure")}
            </>
          ) : (
            <>
              <Lock size={12} className="text-slate-300" />
              <span className="text-slate-300">{t("common.configure")}</span>
            </>
          )}
        </button>
      </div>

      {/* Subtle corner glow when online + hovered + logged in */}
      {online && hovered && isLoggedIn && (
        <div
          className="absolute top-0 right-0 w-20 h-20 pointer-events-none rounded-tr-2xl"
          style={{
            background: `radial-gradient(circle at top right, ${accent}15, transparent 70%)`,
          }}
        />
      )}

      {/* Guest overlay hint on hover */}
      {!isLoggedIn && hovered && (
        <div
          className="absolute inset-0 bg-white/60 dark:bg-gray-900/70 backdrop-blur-[1px] flex items-center justify-center rounded-2xl cursor-pointer"
          onClick={navigateToLogin}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-black/10 dark:border-white/15 shadow-lg">
            <LogIn size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-white tracking-wide">
              {t("devices.signInToViewData")}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/* ─── Main Component ─── */
const ConnectedDevices = ({ isLoggedIn: isLoggedInProp }) => {
  const { isAuthenticated } = useUser();
  const { t, n } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isLoggedIn =
    typeof isLoggedInProp === "boolean" ? isLoggedInProp : isAuthenticated;
  const DEVICES = getDevices(t);
  const onlineCount = DEVICES.filter((d) => d.status === "online").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(16,185,129,0); }
        }

        .font-serif-cg { font-family: 'Cormorant Garamond', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <section
        className="py-10 px-6 max-w-5xl mx-auto"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-7"
        >
          <div>
            {/* Live / Guest badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3"
              style={{
                background: isLoggedIn
                  ? isDark ? "rgba(34,197,94,0.1)" : "rgb(240,253,244)"
                  : isDark ? "rgba(100,116,139,0.1)" : "rgb(248,250,252)",
                borderColor: isLoggedIn
                  ? isDark ? "rgba(34,197,94,0.25)" : "rgb(220,252,231)"
                  : isDark ? "rgba(100,116,139,0.25)" : "rgb(226,232,240)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isLoggedIn ? "#22c55e" : "#94a3b8",
                  animation: isLoggedIn ? "pulse-dot 2s ease infinite" : "none",
                }}
              />
              <span
                className="text-[10.5px] font-medium uppercase tracking-widest"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: isLoggedIn
                    ? isDark ? "#4ade80" : "#15803d"
                    : isDark ? "#94a3b8" : "#64748b",
                }}
              >
                {isLoggedIn ? t("devices.livePreview") : t("devices.guestView")}
              </span>
            </div>

            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none m-0"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t("devices.connectedDevices")}
            </h2>
            <p
              className="mt-1.5 text-xs text-slate-400 dark:text-slate-300 font-normal"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {isLoggedIn ? (
                <>
                  <span className="font-bold text-emerald-500 dark:text-emerald-400">
                    {n(onlineCount)}/{n(DEVICES.length)}
                  </span>{" "}
                  {t("devices.sensorsReporting")}
                </>
              ) : (
                <>
                  <span className="font-medium text-slate-400 dark:text-slate-300">
                    {t("devices.signInToView")}
                  </span>
                </>
              )}
            </p>

            {/* Mobile buttons */}
            <div className="flex gap-2 md:hidden mt-4">
              {isLoggedIn && (
                <button
                  className="px-4 py-2 rounded-md border border-dashed border-black/12 dark:border-white/15 bg-white dark:bg-gray-800 text-[11.5px] font-semibold text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-1.5 tracking-wide hover:scale-105 transition-transform"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Settings size={12} />
                  {t("common.manage")}
                </button>
              )}
              {isLoggedIn ? (
                <button
                  className="px-4 py-2 rounded-md border-none bg-green-600 shadow drop-shadow-2xl text-[11.5px] font-semibold text-white cursor-pointer flex items-center gap-1.5 tracking-wide hover:scale-105 transition-transform"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <ArrowUpRight size={12} />
                  View All
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded-md border-none text-[11.5px] font-semibold text-white cursor-pointer flex items-center gap-1.5 tracking-wide hover:scale-105 transition-transform shadow drop-shadow-2xl"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: "#0ea5e9",
                  }}
                  onClick={navigateToLogin}
                >
                  <LogIn size={12} />
                  {t("common.signIn")}
                </button>
              )}
            </div>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex gap-2">
            {isLoggedIn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 rounded-md border border-dashed border-black/12 dark:border-white/15 bg-white dark:bg-gray-800 text-[11.5px] font-semibold text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-1.5 tracking-wide hover:scale-105 transition-transform"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Settings size={12} />
                {t("common.manage")}
              </motion.button>
            )}

            {isLoggedIn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 rounded-md border-none bg-green-600 shadow drop-shadow-2xl text-[11.5px] font-semibold text-white cursor-pointer flex items-center gap-1.5 tracking-wide hover:scale-105 transition-transform"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <ArrowUpRight size={12} />
                View All
              </motion.button>
            )}

          </div>
        </motion.div>

        {/* Guest CTA Banner */}
        <AnimatePresence>
          {!isLoggedIn && (
            <motion.div
              key="guest-banner"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="mb-5 p-4 rounded-2xl border border-dashed border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-700 flex items-center justify-center">
                  <Eye size={14} className="text-sky-500 dark:text-sky-400" />
                </div>
                <div>
                  <p
                    className="text-[12px] font-semibold text-sky-800 dark:text-sky-200 leading-tight"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {t("devices.guestBanner")}
                  </p>
                  <p
                    className="text-[11px] text-sky-500 dark:text-sky-400 mt-0.5"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {t("devices.guestBannerDesc")}
                  </p>
                </div>
              </div>
              <button
                onClick={navigateToLogin}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white text-[11px] font-semibold flex items-center gap-1.5 hover:bg-sky-600 transition-colors shrink-0"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <LogIn size={11} />
                {t("common.signIn")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEVICES.map((device, i) => (
            <DeviceCard
              key={device.id}
              device={device}
              index={i}
              isLoggedIn={isLoggedIn}
              t={t}
            />
          ))}
        </div>

        {/* Footer Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-5 p-3 rounded-xl border border-dashed border-black/8 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.03] flex items-center justify-between"
        >
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-amber-500 dark:text-amber-400" />
                <span
                  className="text-[11.5px] text-gray-500 dark:text-gray-300 font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {t("devices.deviceAttention")}
                </span>
              </div>
              <button
                className="text-[11px] font-semibold text-amber-500 bg-none border-none cursor-pointer flex items-center gap-0.5 hover:underline"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t("common.resolve")} <ArrowUpRight size={11} />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400 dark:text-slate-300" />
                <span
                  className="text-[11.5px] text-slate-400 dark:text-slate-300 font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {t("devices.alertsAfterSignIn")}
                </span>
              </div>
              <button
                onClick={navigateToLogin}
                className="text-[11px] font-semibold text-sky-500 dark:text-sky-400 bg-none border-none cursor-pointer flex items-center gap-0.5 hover:underline"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {t("common.signIn")} <ArrowUpRight size={11} />
              </button>
            </>
          )}
        </motion.div>
      </section>
    </>
  );
};

export default ConnectedDevices;
