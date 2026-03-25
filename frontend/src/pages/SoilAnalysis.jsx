import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Edit3,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Droplets,
  Thermometer,
  Zap,
  Leaf,
  FlaskConical,
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  X,
  Plus,
  ArrowUpRight,
  Beaker,
  ArrowLeft,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import FileUpload from "@/components/ui/file-upload";
import { useLanguage } from "../context/LanguageContext";

/* ─────────────────────────────────────────
   DEMO DATA
───────────────────────────────────────── */
const SAVED_REPORTS = [
  {
    id: 1,
    name: "North Field — Spring 2024",
    date: "Mar 12, 2024",
    status: "good",
  },
  { id: 2, name: "Greenhouse Plot B", date: "Jan 5, 2024", status: "warning" },
  { id: 3, name: "East Orchard", date: "Nov 18, 2023", status: "critical" },
];

const DEFAULT_VALUES = {
  ph: "6.4",
  nitrogen: "42",
  phosphorus: "28",
  potassium: "185",
  organicMatter: "3.8",
  calcium: "1240",
  magnesium: "180",
  sulfur: "14",
  iron: "48",
  moisture: "32",
};

const RADAR_DATA = [
  { param: "pH Balance", value: 78 },
  { param: "Nitrogen", value: 62 },
  { param: "Phosphorus", value: 45 },
  { param: "Potassium", value: 88 },
  { param: "Org. Matter", value: 72 },
  { param: "Calcium", value: 90 },
];

const NPK_DATA = [
  { name: "Nitrogen", value: 42, ideal: 60, unit: "ppm" },
  { name: "Phosphorus", value: 28, ideal: 40, unit: "ppm" },
  { name: "Potassium", value: 185, ideal: 200, unit: "ppm" },
  { name: "Calcium", value: 1240, ideal: 1500, unit: "ppm" },
  { name: "Magnesium", value: 180, ideal: 200, unit: "ppm" },
  { name: "Sulfur", value: 14, ideal: 20, unit: "ppm" },
];

const TREND_DATA = [
  { month: "Aug", ph: 5.9, nitrogen: 38 },
  { month: "Sep", ph: 6.1, nitrogen: 40 },
  { month: "Oct", ph: 6.2, nitrogen: 39 },
  { month: "Nov", ph: 6.3, nitrogen: 41 },
  { month: "Dec", ph: 6.3, nitrogen: 40 },
  { month: "Jan", ph: 6.4, nitrogen: 42 },
];

const RECOMMENDATIONS = [
  {
    icon: Droplets,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-100",
    label: "Add Nitrogen",
    detail: "Apply 20 kg/ha of urea to boost nitrogen levels to optimal range.",
    urgency: "medium",
  },
  {
    icon: Leaf,
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-100",
    label: "Phosphorus Supplement",
    detail:
      "Use DAP fertilizer at 15 kg/ha. Phosphorus levels are 30% below ideal.",
    urgency: "high",
  },
  {
    icon: FlaskConical,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-100",
    label: "pH is Optimal",
    detail:
      "Current pH of 6.4 is ideal for most crops. No lime or sulfur needed.",
    urgency: "low",
  },
  {
    icon: Zap,
    color: "text-violet-500",
    bg: "bg-violet-50 border-violet-100",
    label: "Increase Organic Matter",
    detail:
      "Add compost at 3–5 tons/ha to improve water retention and microbial activity.",
    urgency: "medium",
  },
];

const METRICS = [
  {
    label: "Overall Score",
    value: "74",
    unit: "/100",
    color: "text-emerald-600",
    sub: "Good Condition",
  },
  {
    label: "pH Level",
    value: "6.4",
    unit: "",
    color: "text-blue-600",
    sub: "Slightly Acidic",
  },
  {
    label: "Organic Matter",
    value: "3.8",
    unit: "%",
    color: "text-amber-600",
    sub: "Moderate",
  },
  {
    label: "Moisture",
    value: "32",
    unit: "%",
    color: "text-teal-600",
    sub: "Adequate",
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-dashed border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-mono">
            {p.name}: {p.value}
            {p.unit || ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─────────────────────────────────────────
   INPUT FIELD
───────────────────────────────────────── */
const Field = ({ label, name, value, onChange, unit }) => (
  <div className="flex flex-col border-r border-b border-dashed border-gray-200 last:border-r-0 p-4">
    <label className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
      {label}
    </label>
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent font-mono text-sm font-semibold text-gray-800 outline-none focus:text-emerald-700 transition-colors placeholder:text-gray-300"
        placeholder="—"
      />
      {unit && (
        <span className="text-[10px] text-gray-400 shrink-0">{unit}</span>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────── */
const Section = ({
  title,
  icon: Icon,
  accent = "text-gray-500",
  children,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-gray-200">
      <div
        className={`w-7 h-7 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center ${accent}`}
      >
        <Icon size={14} />
      </div>
      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
        {title}
      </span>
    </div>
    {children}
  </motion.div>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function SoilAnalysis() {
  const [step, setStep] = useState("choose"); // choose | upload | saved | manual | result
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedSaved, setSelectedSaved] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const fileRef = useRef();
  const [files, setFiles] = useState([]);
  const { t, n } = useLanguage();

  const handleChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleAnalyze = () => setStep("result");
  const handleReset = () => {
    setStep("choose");
    setUploadedFile(null);
    setSelectedSaved(null);
  };

  const addFiles = (incoming) => {
    const deduped = Array.from(incoming).filter(
      (f) => !files.some((e) => e.name === f.name),
    );
    setFiles((prev) => [...prev, ...deduped]);
  };

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setUploadedFile(f);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&family=Cormorant+Garamond:wght@600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-mono { font-family: 'DM Mono', monospace !important; }
        .dashed-grid { background-image: linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px); background-size: 32px 32px; }
      `}</style>

      <div className="min-h-screen bg-gray-50/60 dashed-grid">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 ">
          {/* ── PAGE HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 mt-19"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-600 font-bold">
                Soil Intelligence
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-none tracking-tight">
                  {t("soil.pageTitle")}
                </h1>
                <p className="text-sm text-gray-400 mt-2 font-normal">
                  Upload a report, load a saved one, or enter values manually to
                  get a complete breakdown.
                </p>
              </div>
              {step === "result" && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
                >
                  <RefreshCw size={12} /> New Analysis
                </button>
              )}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ════════════════════════════════
                STEP: CHOOSE INPUT METHOD
            ════════════════════════════════ */}
            {step === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  {
                    key: "upload",
                    icon: Upload,
                    label: "Upload Report",
                    desc: "PDF, image or CSV of your lab soil report",
                    color: "emerald",
                    accent: "text-emerald-600",
                    ring: "hover:border-emerald-400 hover:shadow-emerald-100",
                  },
                  {
                    key: "saved",
                    icon: FileText,
                    label: "Saved Reports",
                    desc: "Use a previously uploaded or analysed report",
                    color: "blue",
                    accent: "text-blue-600",
                    ring: "hover:border-blue-400 hover:shadow-blue-100",
                  },
                  {
                    key: "manual",
                    icon: Edit3,
                    label: "Enter Manually",
                    desc: "Type in your soil parameter values directly",
                    color: "amber",
                    accent: "text-amber-600",
                    ring: "hover:border-amber-400 hover:shadow-amber-100",
                  },
                ].map(({ key, icon: Icon, label, desc, accent, ring }, i) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => setStep(key)}
                    className={`group relative bg-white rounded-2xl border-2 border-dashed border-gray-200 p-7 text-left transition-all duration-300 shadow-sm hover:shadow-lg ${ring}`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center mb-5 group-hover:border-current transition-colors ${accent}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="text-sm font-bold text-gray-800 mb-1">
                      {label}
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      {desc}
                    </div>
                    <ChevronRight
                      size={14}
                      className={`absolute top-6 right-6 ${accent} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* ════════════════════════════════
                STEP: UPLOAD REPORT
            ════════════════════════════════ */}
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-dashed border-gray-200">
                    <button
                      onClick={() => setStep("choose")}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft size={12} />
                      Back
                    </button>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">
                      Upload Soil Report
                    </span>
                  </div>

                  <div className="p-6">
                    <FileUpload
                      files={files}
                      onAdd={addFiles}
                      onRemove={removeFile}
                    />

                    {uploadedFile && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-dashed border-emerald-200"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-700">
                            {uploadedFile.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="text-emerald-400 hover:text-emerald-600"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={handleAnalyze}
                      disabled={!uploadedFile}
                      className="mt-5 w-full py-3 rounded-xl bg-gray-900 text-white text-xs font-bold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={13} /> Analyse Report
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════
                STEP: SAVED REPORTS
            ════════════════════════════════ */}
            {step === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setStep("choose")}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                      >
                        <ArrowLeft size={12} />
                        Back
                      </button>
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">
                        Saved Reports
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">
                      {SAVED_REPORTS.length} reports
                    </span>
                  </div>

                  <div className="divide-y divide-dashed divide-gray-100">
                    {SAVED_REPORTS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedSaved(r.id)}
                        className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/80 transition-colors group ${selectedSaved === r.id ? "bg-emerald-50/60" : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-2 h-2 rounded-full ${r.status === "good" ? "bg-emerald-400" : r.status === "warning" ? "bg-amber-400" : "bg-red-400"}`}
                          />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800">
                              {r.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                              {r.date}
                            </p>
                          </div>
                        </div>
                        {selectedSaved === r.id ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-500"
                          />
                        ) : (
                          <ChevronRight
                            size={14}
                            className="text-gray-300 group-hover:text-gray-500 transition-colors"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 border-t border-dashed border-gray-200">
                    <button
                      onClick={handleAnalyze}
                      disabled={!selectedSaved}
                      className="w-full py-3 rounded-xl bg-gray-900 text-white text-xs font-bold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={13} /> Load & Analyse
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════
                STEP: MANUAL ENTRY
            ════════════════════════════════ */}
            {step === "manual" && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setStep("choose")}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                      >
                        <ArrowLeft size={12} />
                        Back
                      </button>
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">
                        Enter Soil Values
                      </span>
                    </div>
                    <button
                      onClick={() => setValues(DEFAULT_VALUES)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw size={10} /> Reset
                    </button>
                  </div>

                  {/* Primary params */}
                  <div>
                    <div className="px-5 pt-4 pb-2">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-gray-400 font-bold">
                        Primary Parameters
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-dashed border-gray-200">
                      <Field
                        label={t("soil.phLevel")}
                        name="ph"
                        value={values.ph}
                        onChange={handleChange}
                        unit=""
                      />
                      <Field
                        label={t("soil.nitrogen")}
                        name="nitrogen"
                        value={values.nitrogen}
                        onChange={handleChange}
                        unit="ppm"
                      />
                      <Field
                        label={t("soil.phosphorus")}
                        name="phosphorus"
                        value={values.phosphorus}
                        onChange={handleChange}
                        unit="ppm"
                      />
                      <Field
                        label={t("soil.potassium")}
                        name="potassium"
                        value={values.potassium}
                        onChange={handleChange}
                        unit="ppm"
                      />
                    </div>
                  </div>

                  {/* Secondary params */}
                  <div>
                    <div className="px-5 pt-4 pb-2 border-t border-dashed border-gray-200">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-gray-400 font-bold">
                        Secondary Parameters
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 border-t border-dashed border-gray-200">
                      <Field
                        label={t("soil.organic_matter")}
                        name="organicMatter"
                        value={values.organicMatter}
                        onChange={handleChange}
                        unit="%"
                      />
                      <Field
                        label="Calcium"
                        name="calcium"
                        value={values.calcium}
                        onChange={handleChange}
                        unit="ppm"
                      />
                      <Field
                        label="Magnesium"
                        name="magnesium"
                        value={values.magnesium}
                        onChange={handleChange}
                        unit="ppm"
                      />
                      <Field
                        label="Sulfur"
                        name="sulfur"
                        value={values.sulfur}
                        onChange={handleChange}
                        unit="ppm"
                      />
                      <Field
                        label="Iron"
                        name="iron"
                        value={values.iron}
                        onChange={handleChange}
                        unit="ppm"
                      />
                      <Field
                        label={t("soil.moisture")}
                        name="moisture"
                        value={values.moisture}
                        onChange={handleChange}
                        unit="%"
                      />
                    </div>
                  </div>

                  <div className="p-5 border-t border-dashed border-gray-200">
                    <button
                      onClick={handleAnalyze}
                      className="w-full py-3 rounded-xl bg-gray-900 text-white text-xs font-bold tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={13} /> Generate Analysis
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════
                STEP: RESULT / FULL REPORT
            ════════════════════════════════ */}
            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* ── SCORE METRICS ROW ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {METRICS.map(({ label, value, unit, color, sub }, i) => (
                    <div
                      key={label}
                      className={`p-5 ${i < METRICS.length - 1 ? "border-r border-dashed border-gray-200" : ""} flex flex-col justify-between`}
                    >
                      <p className="text-[9px] uppercase tracking-[0.12em] text-gray-400 font-bold mb-3">
                        {label}
                      </p>
                      <div>
                        <div className="flex items-baseline gap-0.5">
                          <span
                            className={`font-mono text-3xl font-bold ${color}`}
                          >
                            {n(value)}
                          </span>
                          <span className="text-xs text-gray-400 ml-0.5">
                            {unit}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── TABS ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-dashed border-gray-200">
                    {["overview", "nutrients", "trends", "recommendations"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-colors border-r border-dashed border-gray-200 last:border-r-0 ${activeTab === tab ? "text-gray-900 bg-gray-50" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          {tab}
                        </button>
                      ),
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-dashed divide-gray-200"
                      >
                        {/* Radar */}
                        <div className="p-6">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-5">
                            Nutrient Radar
                          </p>
                          <ResponsiveContainer width="100%" height={240}>
                            <RadarChart data={RADAR_DATA}>
                              <PolarGrid
                                stroke="#e5e7eb"
                                strokeDasharray="4 4"
                              />
                              <PolarAngleAxis
                                dataKey="param"
                                tick={{
                                  fontSize: 10,
                                  fontFamily: "DM Sans",
                                  fill: "#9ca3af",
                                }}
                              />
                              <Radar
                                name="Soil"
                                dataKey="value"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.12}
                                strokeWidth={2}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* pH & condition summary */}
                        <div className="p-6 space-y-4">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-3">
                            Health Summary
                          </p>
                          {[
                            {
                              label: "pH Balance",
                              score: 78,
                              color: "bg-emerald-400",
                            },
                            {
                              label: t("soil.nitrogen"),
                              score: 62,
                              color: "bg-blue-400",
                            },
                            {
                              label: t("soil.phosphorus"),
                              score: 45,
                              color: "bg-amber-400",
                            },
                            {
                              label: t("soil.potassium"),
                              score: 88,
                              color: "bg-teal-400",
                            },
                            {
                              label: t("soil.organic_matter"),
                              score: 72,
                              color: "bg-violet-400",
                            },
                          ].map(({ label, score, color }) => (
                            <div key={label}>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-xs font-medium text-gray-600">
                                  {label}
                                </span>
                                <span className="font-mono text-xs font-bold text-gray-700">
                                  {n(score)}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{
                                    delay: 0.2,
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                  className={`h-full rounded-full ${color}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* NUTRIENTS TAB */}
                    {activeTab === "nutrients" && (
                      <motion.div
                        key="nutrients"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6"
                      >
                        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-5">
                          Current vs. Ideal (ppm)
                        </p>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart
                            data={NPK_DATA}
                            barCategoryGap="35%"
                            barGap={4}
                          >
                            <CartesianGrid
                              vertical={false}
                              stroke="#f1f5f9"
                              strokeDasharray="4 4"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 10,
                                fontFamily: "DM Mono",
                                fill: "#9ca3af",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{
                                fontSize: 10,
                                fontFamily: "DM Mono",
                                fill: "#9ca3af",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="value"
                              name="Current"
                              fill="#10b981"
                              radius={[6, 6, 0, 0]}
                            />
                            <Bar
                              dataKey="ideal"
                              name="Ideal"
                              fill="#e5e7eb"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>

                        {/* Table */}
                        <div className="mt-6 rounded-xl border border-dashed border-gray-200 overflow-hidden">
                          <div className="grid grid-cols-4 px-4 py-2.5 bg-gray-50 border-b border-dashed border-gray-200">
                            {["Parameter", "Current", "Ideal", "Status"].map(
                              (h) => (
                                <p
                                  key={h}
                                  className="text-[9px] uppercase tracking-widest font-bold text-gray-400"
                                >
                                  {h}
                                </p>
                              ),
                            )}
                          </div>
                          {NPK_DATA.map(({ name, value, ideal }, i) => {
                            const pct = (value / ideal) * 100;
                            const status =
                              pct >= 85
                                ? {
                                    label: "Optimal",
                                    cls: "text-emerald-600 bg-emerald-50",
                                  }
                                : pct >= 60
                                  ? {
                                      label: "Low",
                                      cls: "text-amber-600 bg-amber-50",
                                    }
                                  : {
                                      label: "Deficient",
                                      cls: "text-red-600 bg-red-50",
                                    };
                            return (
                              <div
                                key={name}
                                className={`grid grid-cols-4 px-4 py-3 ${i < NPK_DATA.length - 1 ? "border-b border-dashed border-gray-100" : ""}`}
                              >
                                <span className="text-xs font-semibold text-gray-700">
                                  {name}
                                </span>
                                <span className="font-mono text-xs text-gray-600">
                                  {n(value)}{" "}
                                  <span className="text-gray-300">ppm</span>
                                </span>
                                <span className="font-mono text-xs text-gray-400">
                                  {n(ideal)} ppm
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${status.cls}`}
                                >
                                  {status.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* TRENDS TAB */}
                    {activeTab === "trends" && (
                      <motion.div
                        key="trends"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="divide-y divide-dashed divide-gray-200"
                      >
                        <div className="p-6">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-5">
                            pH Trend (6 months)
                          </p>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={TREND_DATA}>
                              <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="#f1f5f9"
                              />
                              <XAxis
                                dataKey="month"
                                tick={{
                                  fontSize: 10,
                                  fontFamily: "DM Mono",
                                  fill: "#9ca3af",
                                }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                domain={[5.5, 7]}
                                tick={{
                                  fontSize: 10,
                                  fontFamily: "DM Mono",
                                  fill: "#9ca3af",
                                }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line
                                type="monotone"
                                dataKey="ph"
                                name="pH"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="p-6">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-5">
                            Nitrogen Trend (ppm)
                          </p>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={TREND_DATA}>
                              <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="#f1f5f9"
                              />
                              <XAxis
                                dataKey="month"
                                tick={{
                                  fontSize: 10,
                                  fontFamily: "DM Mono",
                                  fill: "#9ca3af",
                                }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{
                                  fontSize: 10,
                                  fontFamily: "DM Mono",
                                  fill: "#9ca3af",
                                }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line
                                type="monotone"
                                dataKey="nitrogen"
                                name="N (ppm)"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    )}

                    {/* RECOMMENDATIONS TAB */}
                    {activeTab === "recommendations" && (
                      <motion.div
                        key="recommendations"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 space-y-4"
                      >
                        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-5">
                          AI Recommendations
                        </p>
                        {RECOMMENDATIONS.map(
                          ({
                            icon: Icon,
                            color,
                            bg,
                            label,
                            detail,
                            urgency,
                          }) => (
                            <div
                              key={label}
                              className={`flex gap-4 p-4 rounded-xl border border-dashed ${bg} transition-all`}
                            >
                              <div
                                className={`w-9 h-9 rounded-xl bg-white/70 border border-dashed border-current/20 flex items-center justify-center shrink-0 ${color}`}
                              >
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-bold text-gray-800">
                                    {label}
                                  </p>
                                  <span
                                    className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-dashed ${urgency === "high" ? "text-red-500 border-red-200 bg-red-50" : urgency === "medium" ? "text-amber-500 border-amber-200 bg-amber-50" : "text-emerald-500 border-emerald-200 bg-emerald-50"}`}
                                  >
                                    {urgency}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                  {detail}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── BOTTOM ACTION ROW ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-dashed divide-gray-200">
                    {[
                      {
                        icon: Download,
                        label: "Download Report",
                        desc: "Export full PDF analysis",
                        accent: "text-gray-700",
                      },
                      {
                        icon: ArrowUpRight,
                        label: "Share with Agronomist",
                        desc: "Send via email or link",
                        accent: "text-blue-600",
                      },
                      {
                        icon: Plus,
                        label: "Schedule Re-test",
                        desc: "Set a soil test reminder",
                        accent: "text-emerald-600",
                      },
                    ].map(({ icon: Icon, label, desc, accent }) => (
                      <button
                        key={label}
                        className="group flex items-center gap-4 px-6 py-5 hover:bg-gray-50/80 transition-colors text-left"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center shrink-0 ${accent} group-hover:border-current transition-colors`}
                        >
                          <Icon size={15} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
