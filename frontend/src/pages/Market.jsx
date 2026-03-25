import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Package,
  BarChart2,
  CheckCircle2,
  Plus,
  Clock,
  Zap,
  ChevronRight,
  RefreshCw,
  Maximize2,
  Minimize2,
  Info,
  Layers,
  Shield,
} from "lucide-react";
import {
  AreaChart,
  Area,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ─────────────────────────────────────────
   DATA CONSTANTS
───────────────────────────────────────── */
const COMMODITIES = [
  {
    id: "wheat",
    name: "Wheat",
    icon: "🌾",
    price: 2450,
    change: +7.8,
    vol: "12.4k",
    msp: 2275,
    grade: "A",
    trend: "up",
  },
  {
    id: "rice",
    name: "Basmati Rice",
    icon: "🌾",
    price: 5820,
    change: +5.1,
    vol: "8.3k",
    msp: 2183,
    grade: "A+",
    trend: "up",
  },
  {
    id: "soybean",
    name: "Soybean",
    icon: "🫘",
    price: 4380,
    change: -1.4,
    vol: "4.2k",
    msp: 4600,
    grade: "A",
    trend: "down",
  },
  {
    id: "cotton",
    name: "Cotton",
    icon: "🪴",
    price: 6680,
    change: +2.7,
    vol: "2.8k",
    msp: 6620,
    grade: "B+",
    trend: "up",
  },
];

const PRICE_HISTORY = {
  wheat: [2100, 2150, 2200, 2180, 2250, 2300, 2450],
  rice: [5400, 5500, 5450, 5600, 5700, 5800, 5820],
  soybean: [4500, 4480, 4450, 4420, 4400, 4390, 4380],
  cotton: [6400, 6450, 6500, 6550, 6600, 6650, 6680],
};

/* ─────────────────────────────────────────
   COMPACT COMPONENTS
───────────────────────────────────────── */
const ChartTip = ({ active, payload }) => {
  const { n } = useLanguage();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-sm px-2 py-1 shadow-sm">
      <p className="font-mono text-[10px] font-bold text-gray-800">
        ₹{n(payload[0].value)}
      </p>
    </div>
  );
};

const MarketStat = ({ label, value, sub, icon: Icon }) => (
  <div className="bg-white p-4 border border-dashed border-gray-200 rounded-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
        {label}
      </span>
      <Icon size={12} className="text-gray-400" />
    </div>
    <p className="font-mono text-xl font-bold text-gray-900 leading-none">
      {value}
    </p>
    <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
  </div>
);

/* ─────────────────────────────────────────
   MAIN MARKET COMPONENT
───────────────────────────────────────── */
const Market = () => {
  const { t, n } = useLanguage();
  const [selected, setSelected] = useState(COMMODITIES[0]);
  const [expanded, setExpanded] = useState(false);

  const chartData = PRICE_HISTORY[selected.id].map((v, i) => ({ i, v }));
  const up = selected.trend === "up";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        
        .market-grid-bg {
          background-color: #fafbfa;
          background-image: 
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .progressive-blur::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(250, 251, 250, 0.9) 70%, #fafbfa);
          pointer-events: none;
          opacity: ${expanded ? 0 : 1};
          transition: opacity 0.4s ease;
        }
      `}</style>

      <div className="market-grid-bg min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-6">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-19">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-sm bg-emerald-50 border border-dashed border-emerald-200 mb-2">
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">
                  Real-time Exchange
                </span>
              </div>
              <h1 className="text-5xl font-bold font-cormorant text-gray-900 tracking-tight">
                {t("market.title")}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-gray-200 rounded-sm text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
                <RefreshCw size={12} /> Sync Data
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-sm text-[11px] font-bold hover:bg-emerald-800 transition-all shadow-sm">
                <Plus size={12} /> Create Listing
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MarketStat
              label="Avg Price Index"
              value={n("↑ 4.2%")}
              sub={n("+ ₹84.0") + " vs LW"}
              icon={TrendingUp}
            />
            <MarketStat
              label="Trade Volume"
              value={n("1.2M") + " qtl"}
              sub="Live orders"
              icon={BarChart2}
            />
            <MarketStat
              label={t("market.nearbyMandis")}
              value={n("84")}
              sub={"Across " + n(12) + " zones"}
              icon={MapPin}
            />
            <MarketStat
              label="Verified Sellers"
              value={n("1.8k")}
              sub={"+" + n(12) + " today"}
              icon={CheckCircle2}
            />
          </div>

          {/* Main Content: Table & Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Commodity Table */}
            <div className="lg:col-span-7 bg-white border border-dashed border-gray-200 rounded-sm overflow-hidden shadow-sm">
              <div className="grid grid-cols-4 bg-gray-50/50 border-b border-dashed border-gray-200 px-4 py-2">
                {["Commodity", "Price/MSP", "Change", "Status"].map((h) => (
                  <span
                    key={h}
                    className="text-[9px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div
                className={`relative transition-all duration-500 overflow-hidden ${expanded ? "max-h-[1000px]" : "max-h-[320px] progressive-blur"}`}
              >
                {COMMODITIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`w-full grid grid-cols-4 items-center px-4 py-4 border-b border-dashed border-gray-100 last:border-0 transition-all text-left
                      ${selected.id === c.id ? "bg-emerald-50/40" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-xs font-bold text-gray-800">
                        {c.name}
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-gray-900">
                        ₹{n(c.price)}
                      </p>
                      <p className="text-[9px] text-gray-400 font-mono">
                        MSP ₹{n(c.msp)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${c.change > 0 ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {c.change > 0 ? (
                          <ArrowUpRight size={10} />
                        ) : (
                          <ArrowDownRight size={10} />
                        )}
                        {n(Math.abs(c.change))}%
                      </span>
                    </div>
                    <div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-dashed ${c.change > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}
                      >
                        {c.change > 0 ? "BULLISH" : "BEARISH"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full py-3 bg-white border-t border-dashed border-gray-200 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
              >
                {expanded ? (
                  <>
                    <Minimize2 size={12} /> Show Less
                  </>
                ) : (
                  <>
                    <Maximize2 size={12} /> Expand Market List
                  </>
                )}
              </button>
            </div>

            {/* Analysis Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-dashed border-gray-200 rounded-sm p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-gray-900 flex items-center justify-center text-white text-sm">
                      {selected.icon}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Selected Focus
                      </p>
                      <h3 className="text-sm font-bold text-gray-900">
                        {selected.name} Analysis
                      </h3>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-sm border border-dashed text-[10px] font-bold ${up ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-red-50 border-red-200 text-red-600"}`}
                  >
                    {up ? "+" : ""}
                    {n(selected.change)}%
                  </div>
                </div>

                <div className="h-32 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="chartColor"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={up ? "#10b981" : "#ef4444"}
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor={up ? "#10b981" : "#ef4444"}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip content={<ChartTip />} />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={up ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        fill="url(#chartColor)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-dashed border-gray-100 pt-4">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Spread vs MSP
                    </p>
                    <p className="text-sm font-bold text-gray-800 font-mono">
                      {selected.price - selected.msp > 0 ? "+" : ""}₹
                      {n(selected.price - selected.msp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                      Quality Grade
                    </p>
                    <p className="text-sm font-bold text-emerald-600 font-mono">
                      {selected.grade}
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Alerts Strip */}
              <div className="bg-amber-50 border border-dashed border-amber-200 rounded-sm p-4 flex items-start gap-3">
                <Zap size={14} className="text-amber-600 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-900">
                    {t("market.farmerIntelligence")}
                  </p>
                  <p className="text-[10px] text-amber-700 leading-relaxed mt-1">
                    Wheat prices in Punjab Mandi are trending 12% higher than
                    state average. Optimal window for liquidation detected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust/Info Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-dashed border-gray-200 pt-6">
            <div className="flex items-center gap-3">
              <Shield className="text-gray-400" size={14} />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Verified FPO Listings
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Layers className="text-gray-400" size={14} />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                MSP Comparison Engine
              </span>
            </div>
            <div className="flex items-center gap-3 md:justify-end">
              <Clock className="text-gray-400" size={14} />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Last Sync: 5 mins ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Market;
