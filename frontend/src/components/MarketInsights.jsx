import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MapPin,
  Leaf,
  Truck,
  Award,
  Clock,
  ChevronRight,
  BarChart2,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  Eye,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  Lock,
  LogIn,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";

const navigateToLogin = () => {
  window.location.href = "/login";
};

/* ─────────────────────────────────────────
    DATA
───────────────────────────────────────── */
const REGIONS = [
  { name: "Punjab", price: "+8.2%", demand: "High", crops: ["Wheat", "Rice"] },
  {
    name: "Haryana",
    price: "+5.7%",
    demand: "High",
    crops: ["Wheat", "Cotton"],
  },
  { name: "MP", price: "+3.1%", demand: "Medium", crops: ["Soybean", "Wheat"] },
  { name: "UP", price: "+4.5%", demand: "High", crops: ["Rice", "Sugarcane"] },
  {
    name: "Maharashtra",
    price: "+2.8%",
    demand: "Medium",
    crops: ["Sugarcane", "Cotton"],
  },
  {
    name: "Gujarat",
    price: "+6.3%",
    demand: "High",
    crops: ["Cotton", "Groundnut"],
  },
];

const PROFIT_TIPS = [
  {
    crop: "Wheat",
    tip: "Premium varieties (HD-2967) fetching 12% higher price in Punjab",
    savings: "+₹280/qtl",
    urgent: false,
  },
  {
    crop: "Basmati Rice",
    tip: "Export demand rising - Grade A+ paddy at 8% premium",
    savings: "+₹420/qtl",
    urgent: true,
  },
  {
    crop: "Cotton",
    tip: "Ginning nearby: Save ₹150/qtl on transport to Rajkot",
    savings: "Save ₹150/qtl",
    urgent: false,
  },
  {
    crop: "Sugarcane",
    tip: "Three new sugar mills opened in Kolhapur district",
    savings: "Better rates",
    urgent: true,
  },
];

const WEATHER_IMPACT = [
  {
    region: "Punjab",
    condition: "Favorable",
    impact: "+",
    crops: "Wheat, Rice",
  },
  { region: "MP", condition: "Rain expected", impact: "→", crops: "Soybean" },
  { region: "Gujarat", condition: "Dry spell", impact: "-", crops: "Cotton" },
];

const PRICE_FORECAST = [
  {
    crop: "Wheat",
    trend: "up",
    forecast: "₹2,520",
    change: "+2.9%",
    confidence: 85,
  },
  {
    crop: "Rice",
    trend: "up",
    forecast: "₹5,980",
    change: "+2.7%",
    confidence: 82,
  },
  {
    crop: "Soybean",
    trend: "down",
    forecast: "₹4,290",
    change: "-2.1%",
    confidence: 78,
  },
  {
    crop: "Cotton",
    trend: "up",
    forecast: "₹6,820",
    change: "+2.1%",
    confidence: 88,
  },
];

/* ─────────────────────────────────────────
    COMPONENTS
───────────────────────────────────────── */
const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  sub,
  accent = "emerald",
  locked = false,
  lockLabel = "Sign in to unlock",
  signInLabel = "Sign in",
}) => {
  const { n } = useLanguage();
  const accentColors = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    rose: "text-rose-600 bg-rose-50 border-rose-200",
  };

  return (
    <div
      className={`bg-white rounded-xl border border-dashed border-gray-200 p-4 relative overflow-hidden ${locked ? "cursor-pointer group" : ""}`}
      onClick={locked ? navigateToLogin : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={`w-8 h-8 rounded-lg border border-dashed flex items-center justify-center ${accentColors[accent]}`}
        >
          <Icon size={14} />
        </div>
        {change && !locked && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-dashed flex items-center gap-0.5
            ${change > 0 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-600 bg-red-50 border-red-200"}`}
          >
            {change > 0 ? (
              <ArrowUpRight size={9} />
            ) : (
              <ArrowDownRight size={9} />
            )}
            {n(Math.abs(change))}%
          </span>
        )}
        {locked && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-dashed flex items-center gap-0.5 text-slate-400 bg-slate-50 border-slate-200">
            <Lock size={9} />
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium text-gray-500 mb-1">{label}</p>
      {locked ? (
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-20 rounded bg-slate-100 animate-pulse" />
        </div>
      ) : (
        <p className="font-mono text-xl font-bold text-gray-900 leading-none mb-1">
          {value}
        </p>
      )}
      {sub && !locked && <p className="text-[10px] text-gray-400">{sub}</p>}
      {locked && (
        <p className="text-[10px] text-slate-300 mt-1">{lockLabel}</p>
      )}

      {locked && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-sky-50/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 bg-white border border-sky-200 rounded-full px-3 py-1 shadow-sm">
            <LogIn size={11} /> {signInLabel}
          </span>
        </div>
      )}
    </div>
  );
};

const RegionRow = ({ region, index, locked = false }) => {
  const priceChange = parseFloat(
    region.price.replace("%", "").replace("+", ""),
  );
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`grid grid-cols-[1fr,70px,80px] items-center py-2.5 border-b border-dashed border-gray-200 last:border-b-0 text-[12px] ${locked ? "cursor-pointer group relative" : ""}`}
      onClick={locked ? navigateToLogin : undefined}
    >
      <div className="min-w-0 pr-2">
        <p className="font-medium text-gray-800 truncate">{region.name}</p>
        <p className="text-[9px] text-gray-400 mt-0.5 truncate">
          {region.crops.join(" · ")}
        </p>
      </div>
      <div>
        {locked ? (
          <span className="inline-block w-10 h-3.5 rounded bg-slate-100 animate-pulse" />
        ) : (
          <span
            className={`font-mono font-bold ${priceChange > 0 ? "text-emerald-600" : "text-red-500"}`}
          >
            {region.price}
          </span>
        )}
      </div>
      <div className="text-right">
        {locked ? (
          <span className="inline-block w-12 h-4 rounded-full bg-slate-100 animate-pulse" />
        ) : (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-dashed
            ${region.demand === "High" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}
          >
            {region.demand}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const TipCard = ({ tip, index, locked = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className={`bg-white rounded-xl border border-dashed p-3.5 relative overflow-hidden
      ${tip.urgent ? "border-amber-200 bg-amber-50/30" : "border-gray-200"}
      ${locked ? "cursor-pointer group" : ""}`}
    onClick={locked ? navigateToLogin : undefined}
  >
    <div className="flex items-start gap-2.5">
      <div
        className={`w-7 h-7 rounded-lg border border-dashed flex items-center justify-center shrink-0 mt-0.5
        ${tip.urgent ? "border-amber-200 bg-amber-50 text-amber-600" : "border-emerald-200 bg-emerald-50 text-emerald-600"}`}
      >
        {tip.urgent ? <Zap size={12} /> : <Sparkles size={12} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[11px] font-bold text-gray-700">
            {tip.crop}
          </span>
          {!locked && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-dashed
              ${tip.urgent ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200"}`}
            >
              {tip.savings}
            </span>
          )}
          {locked && (
            <span className="inline-block w-16 h-3.5 rounded-full bg-slate-100 animate-pulse" />
          )}
        </div>
        {locked ? (
          <div className="space-y-1">
            <div className="h-2.5 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-2.5 w-3/4 rounded bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <p className="text-[12px] text-gray-600 leading-tight">{tip.tip}</p>
        )}
      </div>
    </div>
    {locked && (
      <div className="absolute inset-0 bg-white/0 group-hover:bg-sky-50/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 bg-white border border-sky-200 rounded-full px-3 py-1 shadow-sm">
          <LogIn size={11} /> {tip.signInLabel || "Sign in to view"}
        </span>
      </div>
    )}
  </motion.div>
);

const WeatherBadge = ({ item }) => {
  const colors = {
    "+": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "→": "text-amber-600 bg-amber-50 border-amber-200",
    "-": "text-rose-600 bg-rose-50 border-rose-200",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 last:border-b-0 text-[12px]">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium text-gray-700">{item.region}</span>
        <span className="text-[9px] text-gray-400 truncate">{item.crops}</span>
      </div>
      <span
        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-dashed shrink-0 ${colors[item.impact]}`}
      >
        {item.condition}
      </span>
    </div>
  );
};

const ForecastRow = ({ item, index, locked = false }) => {
  const { n } = useLanguage();
  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.03 }}
    className={`flex items-center justify-between py-2 border-b border-dashed border-gray-200 last:border-b-0 ${locked ? "cursor-pointer group relative" : ""}`}
    onClick={locked ? navigateToLogin : undefined}
  >
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[13px] font-medium text-gray-800 min-w-[60px] truncate">
        {item.crop}
      </span>
      {!locked && (
        <div className="flex items-center gap-1 shrink-0">
          {item.trend === "up" ? (
            <TrendingUp size={10} className="text-emerald-500" />
          ) : (
            <TrendingDown size={10} className="text-red-500" />
          )}
          <span
            className={`text-[10px] font-bold ${item.trend === "up" ? "text-emerald-600" : "text-red-500"}`}
          >
            {n(item.change)}
          </span>
        </div>
      )}
      {locked && (
        <span className="inline-block w-10 h-3 rounded bg-slate-100 animate-pulse" />
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {locked ? (
        <span className="inline-block w-14 h-4 rounded bg-slate-100 animate-pulse" />
      ) : (
        <>
          <span className="font-mono text-sm font-bold text-gray-900">
            {n(item.forecast)}
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-dashed border-gray-200">
            {n(item.confidence)}%
          </span>
        </>
      )}
    </div>
  </motion.div>
);
};

/* ─────────────────────────────────────────
    LOCKED SECTION OVERLAY
───────────────────────────────────────── */
const LockedSection = ({
  children,
  label = "Sign in to unlock full insights",
  signInLabel = "Sign In",
}) => (
  <div className="relative rounded-xl overflow-hidden">
    <div className="pointer-events-none select-none opacity-40 blur-[2px]">
      {children}
    </div>
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
      <div
        className="flex flex-col items-center gap-2 px-5 py-4 bg-white rounded-2xl border border-dashed border-sky-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={navigateToLogin}
      >
        <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center">
          <Lock size={14} className="text-sky-500" />
        </div>
        <p className="text-[11px] font-semibold text-slate-700 text-center leading-snug max-w-[140px]">
          {label}
        </p>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-sky-500 hover:bg-sky-600 px-3 py-1.5 rounded-full transition-colors">
          <LogIn size={10} /> {signInLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
    MAIN
───────────────────────────────────────── */
const MarketInsights = ({ isLoggedIn: isLoggedInProp }) => {
  const { isAuthenticated } = useUser();
  const { t, n } = useLanguage();
  const isLoggedIn =
    typeof isLoggedInProp === "boolean" ? isLoggedInProp : isAuthenticated;
  const [expanded, setExpanded] = useState(false);
  const [showAllTips, setShowAllTips] = useState(false);
  const displayedTips = showAllTips
    ? PROFIT_TIPS
    : PROFIT_TIPS.slice(0, isLoggedIn ? 2 : 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .insight-bg {
          background-color: #fafbfa;
          background-image: linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .expand-blur::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
          background: linear-gradient(to bottom, transparent, rgba(250, 251, 250, 0.8) 60%, #fafbfa);
          pointer-events: none; transition: opacity 0.3s ease;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="insight-bg min-h-[450px] py-6 md:py-8 max-w-5xl mx-auto rounded-xl font-dm">
        <div className="px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 mb-2">
                <span className="text-[10px] text-green-700 font-medium uppercase tracking-widest font-dm">
                  {t("market.farmerIntelligence")}
                </span>
              </div>
              <h1 className="font-cormorant text-2xl md:text-4xl font-bold text-gray-900">
                {t("market.title")}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isLoggedIn && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-gray-200 rounded-md text-[11px] font-bold text-gray-700 hover:scale-105 transition-transform"
                >
                  {expanded ? (
                    <>
                      <Minimize2 size={13} /> {t("market.collapse")}
                    </>
                  ) : (
                    <>
                      <Maximize2 size={13} /> {t("market.expand")}
                    </>
                  )}
                </button>
              )}
              {isLoggedIn && (
                <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-md text-[11px] font-bold hover:scale-105 transition-transform">
                  <Eye size={13} /> {t("market.viewFull")} <ArrowRight size={13} />
                </button>
              )}
            </div>
          </motion.div>
          {/* Guest Banner */}
          <AnimatePresence>
            {!isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-4 md:mx-1 mb-5 p-3.5 rounded-xl border border-dashed border-sky-200 bg-sky-50/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0">
                    <Eye size={13} className="text-sky-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold text-sky-800 leading-tight">
                      {t("market.guestPreview")}
                    </p>
                    <p className="text-[10.5px] text-sky-500 mt-0.5 truncate">
                      {t("market.guestPreviewDesc")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={navigateToLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold rounded-lg shrink-0 transition-colors"
                >
                  <LogIn size={11} /> {t("common.signIn")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div
            className={`relative transition-all duration-500 ease-in-out ${isLoggedIn && !expanded ? "max-h-[350px] overflow-hidden expand-blur" : "max-h-[2000px]"}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ── Column 1 ── */}
              <div className="space-y-4">
                {/* Best Price: visible to guests (demo value) */}
                <StatCard
                  icon={DollarSign}
                  label={t("market.bestPriceToday")}
                  value="₹2,520/qtl"
                  change={8.2}
                  sub="Wheat · Punjab mandi"
                  accent="emerald"
                  locked={false}
                />

                {/* Active Buyers: locked for guests */}
                {isLoggedIn ? (
                  <StatCard
                    icon={ShoppingBag}
                    label={t("market.activeBuyers")}
                    value="1,847"
                    change={12}
                    sub="+124 in last 24h"
                    accent="blue"
                  />
                ) : (
                  <StatCard
                    icon={ShoppingBag}
                    label={t("market.activeBuyers")}
                    value=""
                    change={null}
                    sub=""
                    accent="blue"
                    locked={true}
                    lockLabel={t("market.signInToUnlock")}
                    signInLabel={t("common.signIn")}
                  />
                )}

                {/* Nearby Mandis: locked for guests */}
                {isLoggedIn ? (
                  <StatCard
                    icon={Truck}
                    label={t("market.nearbyMandis")}
                    value="8 within 50km"
                    change={null}
                    sub="Best rate: Ludhiana"
                    accent="amber"
                  />
                ) : (
                  <StatCard
                    icon={Truck}
                    label={t("market.nearbyMandis")}
                    value=""
                    change={null}
                    sub=""
                    accent="amber"
                    locked={true}
                    lockLabel={t("market.signInToUnlock")}
                    signInLabel={t("common.signIn")}
                  />
                )}

                {/* Weather: show region names but lock conditions for guests */}
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 border border-dashed border-blue-200 flex items-center justify-center text-blue-600">
                        <Calendar size={12} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">
                        {t("market.weatherImpact")}
                      </span>
                    </div>
                  </div>
                  {isLoggedIn ? (
                    <div className="space-y-1">
                      {WEATHER_IMPACT.map((item, i) => (
                        <WeatherBadge key={i} item={item} />
                      ))}
                    </div>
                  ) : (
                    <LockedSection label={t("market.signInToUnlock")} signInLabel={t("common.signIn")}>
                      <div className="space-y-1">
                        {WEATHER_IMPACT.map((item, i) => (
                          <WeatherBadge key={i} item={item} />
                        ))}
                      </div>
                    </LockedSection>
                  )}
                </div>
              </div>

              {/* ── Column 2 ── */}
              <div className="space-y-4">
                {/* Profit Opportunities: show 1 tip to guests, rest locked */}
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-50 border border-dashed border-amber-200 flex items-center justify-center text-amber-600">
                        <Sparkles size={12} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">
                        {t("market.profitOpportunities")}
                      </span>
                    </div>
                    {isLoggedIn && (
                      <button
                        onClick={() => setShowAllTips(!showAllTips)}
                        className="flex items-center gap-1 text-[9px] font-bold text-gray-500"
                      >
                        {showAllTips ? (
                          <>
                            <ChevronUp size={10} /> Less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={10} /> All
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Show first tip to everyone */}
                    <TipCard tip={PROFIT_TIPS[0]} index={0} locked={false} />
                    {/* Second tip: locked for guests */}
                    {isLoggedIn ? (
                      <TipCard tip={PROFIT_TIPS[1]} index={1} locked={false} />
                    ) : (
                      <TipCard tip={PROFIT_TIPS[1]} index={1} locked={true} />
                    )}
                    {/* Rest only for logged in */}
                    {isLoggedIn &&
                      showAllTips &&
                      PROFIT_TIPS.slice(2).map((tip, i) => (
                        <TipCard
                          key={i}
                          tip={tip}
                          index={i + 2}
                          locked={false}
                        />
                      ))}
                    {/* Guest upsell after locked card */}
                    {!isLoggedIn && (
                      <button
                        onClick={navigateToLogin}
                        className="w-full py-2 mt-1 text-[10px] font-semibold text-sky-600 border border-dashed border-sky-200 rounded-lg bg-sky-50/60 hover:bg-sky-100/60 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Lock size={10} /> 2 {t("market.moreOpportunities")} <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Price Forecast: show crop names + trends but lock values for guests */}
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 border border-dashed border-purple-200 flex items-center justify-center text-purple-600">
                      <BarChart2 size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">
                      {t("market.priceForecast")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {PRICE_FORECAST.map((item, i) => (
                      <ForecastRow
                        key={i}
                        item={item}
                        index={i}
                        locked={!isLoggedIn && i >= 1}
                      />
                    ))}
                  </div>
                  {!isLoggedIn && (
                    <button
                      onClick={navigateToLogin}
                      className="w-full mt-2 py-1.5 text-[10px] font-semibold text-sky-600 border-t border-dashed border-gray-200 flex items-center justify-center gap-1 hover:underline"
                    >
                      <Lock size={9} /> {t("market.viewFullForecast")}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Column 3 ── */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-dashed border-emerald-200 flex items-center justify-center text-emerald-600">
                      <MapPin size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">
                      {t("market.regionalPrices")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {/* Show 2 regions to guests, lock the rest */}
                    {REGIONS.slice(0, isLoggedIn ? 5 : 2).map((region, i) => (
                      <RegionRow
                        key={i}
                        region={region}
                        index={i}
                        locked={false}
                      />
                    ))}
                    {!isLoggedIn &&
                      REGIONS.slice(2, 5).map((region, i) => (
                        <RegionRow
                          key={i + 2}
                          region={region}
                          index={i + 2}
                          locked={true}
                        />
                      ))}
                  </div>
                  {isLoggedIn ? (
                    <button className="w-full mt-2 text-[9px] font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 py-1.5 border-t border-dashed border-gray-200">
                      {t("market.viewAllRegions")} <ChevronRight size={9} />
                    </button>
                  ) : (
                    <button
                      onClick={navigateToLogin}
                      className="w-full mt-2 text-[9px] font-bold text-sky-500 hover:text-sky-600 flex items-center justify-center gap-1 py-1.5 border-t border-dashed border-gray-200"
                    >
                      <Lock size={9} /> {t("market.signInRegions", { count: REGIONS.length })}{" "}
                      <ChevronRight size={9} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expand Toggle (logged-in only) */}
          {isLoggedIn && !expanded && (
            <div className="relative z-10 -mt-12 flex justify-center">
              <button
                onClick={() => setExpanded(true)}
                className="bg-white border border-dashed border-gray-200 rounded-xl px-6 py-3 shadow-lg flex items-center gap-2 text-[12px] font-bold text-gray-700 hover:text-emerald-600"
              >
                <Maximize2 size={14} /> {t("market.expandAllInsights")}{" "}
                <ChevronDown size={14} />
              </button>
            </div>
          )}

          {/* Bottom Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-xl border border-dashed border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto no-scrollbar">
              <div className="p-3 flex items-center justify-between min-w-[700px] md:min-w-0">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 shrink-0">
                    <AlertCircle
                      size={12}
                      className={
                        isLoggedIn ? "text-amber-500" : "text-slate-300"
                      }
                    />
                    {isLoggedIn ? (
                      <span className="text-[11px] text-gray-600">
                        <span className="font-bold">
                          {t("market.urgentOpportunities")}
                        </span>{" "}
                        {t("market.inYourRegion")}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Lock size={9} />
                        <span className="italic">
                          {t("market.alertsAfterSignIn")}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[11px] text-gray-600">
                      {t("market.mspUpdate")}{" "}
                      <span className="font-bold text-emerald-600">7.8%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400">
                      {t("market.updatedAgo")}
                    </span>
                  </div>
                </div>
                {isLoggedIn ? (
                  <button className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0 ml-4">
                    {t("market.viewAllAlerts")} <ChevronRight size={10} />
                  </button>
                ) : (
                  <button
                    onClick={navigateToLogin}
                    className="flex items-center gap-1 text-[10px] font-bold text-sky-500 shrink-0 ml-4 hover:underline"
                  >
                    {t("common.signIn")} <ChevronRight size={10} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default MarketInsights;
