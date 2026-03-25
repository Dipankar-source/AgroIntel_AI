import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import {
  Plus,
  Leaf,
  Droplets,
  Sun,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sprout,
  Wheat,
  Apple,
  Flower2,
  Filter,
  TrendingUp,
  CloudRain,
  Thermometer,
  Trash2,
  Edit2,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const CURRENT_MONTH = 1; // Feb

const CROPS = [
  {
    id: 1,
    name: "Wheat",
    variety: "HD-2967",
    field: "North Field · Plot A",
    icon: Wheat,
    color: "amber",
    accent: "#d97706",
    light: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    sowStart: 9,
    sowEnd: 10,
    harvestStart: 2,
    harvestEnd: 3,
    status: "growing",
    daysLeft: 38,
    progress: 72,
    area: "4.2 ha",
    expectedYield: "5.8 t/ha",
    waterNeed: "High",
    tasks: [
      {
        label: "Apply 2nd fertilizer dose",
        due: "Feb 28",
        done: false,
        urgent: true,
      },
      {
        label: "Irrigation scheduled",
        due: "Mar 3",
        done: false,
        urgent: false,
      },
      { label: "Pest scouting", due: "Mar 10", done: false, urgent: false },
    ],
    conditions: { temp: "22°C", rain: "12mm", sun: "7h" },
  },
  {
    id: 2,
    name: "Tomato",
    variety: "Hybrid F1",
    field: "Greenhouse · Block C",
    icon: Apple,
    color: "red",
    accent: "#dc2626",
    light: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-400",
    sowStart: 1,
    sowEnd: 2,
    harvestStart: 4,
    harvestEnd: 6,
    status: "seedling",
    daysLeft: 92,
    progress: 18,
    area: "0.8 ha",
    expectedYield: "28 t/ha",
    waterNeed: "Very High",
    tasks: [
      {
        label: "Transplant seedlings",
        due: "Mar 1",
        done: false,
        urgent: true,
      },
      {
        label: "Set up drip irrigation",
        due: "Mar 5",
        done: false,
        urgent: false,
      },
    ],
    conditions: { temp: "28°C", rain: "0mm", sun: "6h" },
  },
  {
    id: 3,
    name: "Sunflower",
    variety: "NK Armoni",
    field: "East Field · Plot B",
    icon: Flower2,
    color: "yellow",
    accent: "#ca8a04",
    light: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
    sowStart: 2,
    sowEnd: 3,
    harvestStart: 7,
    harvestEnd: 8,
    status: "planned",
    daysLeft: 180,
    progress: 0,
    area: "6.0 ha",
    expectedYield: "2.1 t/ha",
    waterNeed: "Medium",
    tasks: [
      { label: "Soil preparation", due: "Feb 26", done: true, urgent: false },
      { label: "Seed procurement", due: "Mar 1", done: false, urgent: false },
      { label: "Sow seeds", due: "Mar 10", done: false, urgent: false },
    ],
    conditions: { temp: "26°C", rain: "8mm", sun: "8h" },
  },
  {
    id: 4,
    name: "Rice",
    variety: "BPT 5204",
    field: "South Paddock",
    icon: Sprout,
    color: "green",
    accent: "#16a34a",
    light: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-400",
    sowStart: 5,
    sowEnd: 6,
    harvestStart: 9,
    harvestEnd: 10,
    status: "planned",
    daysLeft: 240,
    progress: 0,
    area: "12.4 ha",
    expectedYield: "6.5 t/ha",
    waterNeed: "Very High",
    tasks: [
      { label: "Field levelling", due: "Apr 15", done: false, urgent: false },
      {
        label: "Nursery preparation",
        due: "May 1",
        done: false,
        urgent: false,
      },
    ],
    conditions: { temp: "30°C", rain: "0mm", sun: "9h" },
  },
];

const FIELDS = [
  "All Fields",
  "North Field · Plot A",
  "Greenhouse · Block C",
  "East Field · Plot B",
  "South Paddock",
];
const STATUS_OPTIONS = ["All", "growing", "seedling", "planned", "harvested"];

const STATUS_META = {
  growing: {
    label: "Growing",
    cls: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  seedling: {
    label: "Seedling",
    cls: "text-blue-600 bg-blue-50 border-blue-200",
  },
  planned: {
    label: "Planned",
    cls: "text-gray-500 bg-gray-50 border-gray-200",
  },
  harvested: {
    label: "Harvested",
    cls: "text-amber-600 bg-amber-50 border-amber-200",
  },
};

const WEATHER = [
  { day: "Today", icon: Sun, temp: "29°", rain: "0%", color: "text-amber-500" },
  {
    day: "Wed",
    icon: CloudRain,
    temp: "24°",
    rain: "70%",
    color: "text-blue-400",
  },
  {
    day: "Thu",
    icon: CloudRain,
    temp: "22°",
    rain: "60%",
    color: "text-blue-400",
  },
  { day: "Fri", icon: Sun, temp: "27°", rain: "10%", color: "text-amber-500" },
  { day: "Sat", icon: Sun, temp: "30°", rain: "5%", color: "text-amber-500" },
];

/* ─────────────────────────────────────────
   TIMELINE BAR
───────────────────────────────────────── */
const TimelineBar = ({
  sowStart,
  sowEnd,
  harvestStart,
  harvestEnd,
  accent,
}) => {
  const toPos = (m) => (m / 12) * 100;
  const wrap = (s, e) =>
    e < s
      ? [
          { s, e: 12 },
          { s: 0, e },
        ]
      : [{ s, e }];

  return (
    <div className="relative h-5 w-full">
      {/* month tick marks */}
      {MONTHS.map((_, i) => (
        <div
          key={i}
          style={{ left: `${(i / 12) * 100}%` }}
          className="absolute top-0 bottom-0 border-l border-dashed border-gray-100"
        />
      ))}
      {/* sow bar */}
      {wrap(sowStart, sowEnd).map(({ s, e }, i) => (
        <div
          key={`s${i}`}
          style={{
            left: `${toPos(s)}%`,
            width: `${toPos(e - s)}%`,
            background: accent + "40",
            border: `1.5px dashed ${accent}`,
          }}
          className="absolute top-1 bottom-1 rounded-full"
        />
      ))}
      {/* harvest bar */}
      {wrap(harvestStart, harvestEnd).map(({ s, e }, i) => (
        <div
          key={`h${i}`}
          style={{
            left: `${toPos(s)}%`,
            width: `${toPos(e - s)}%`,
            background: accent,
          }}
          className="absolute top-1 bottom-1 rounded-full opacity-80"
        />
      ))}
      {/* current month needle */}
      <div
        style={{ left: `${((CURRENT_MONTH + 0.5) / 12) * 100}%` }}
        className="absolute top-0 bottom-0 w-[2px] bg-emerald-500 rounded-full z-10"
      />
    </div>
  );
};

/* ─────────────────────────────────────────
   CROP CARD
───────────────────────────────────────── */
const CropCard = ({ crop, onSelect, selected, delay }) => {
  const { t, n } = useLanguage();
  const {
    name,
    variety,
    field,
    icon: Icon,
    color,
    accent,
    light,
    border,
    text,
    dot,
    sowStart,
    sowEnd,
    harvestStart,
    harvestEnd,
    status,
    daysLeft,
    progress,
    area,
    tasks,
  } = crop;
  const sm = STATUS_META[status];
  const pendingTasks = tasks.filter((t) => !t.done).length;
  const urgentTasks = tasks.filter((t) => !t.done && t.urgent).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect(crop.id === selected ? null : crop.id)}
      className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300
        ${selected === crop.id ? `border-dashed ${border} shadow-lg` : "border-dashed border-gray-200 hover:border-gray-300 hover:shadow-md"}`}
    >
      {/* top accent line */}
      <div
        className="h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}60)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-dashed border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${light} border border-dashed ${border} flex items-center justify-center ${text}`}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {name}
            </p>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              {variety}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {urgentTasks > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-dashed border-red-200">
              <AlertTriangle size={8} /> {n(urgentTasks)} urgent
            </span>
          )}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-dashed ${sm.cls}`}
          >
            {sm.label}
          </span>
        </div>
      </div>

      {/* Field + Area row */}
      <div className="grid grid-cols-2 border-b border-dashed border-gray-200">
        <div className="flex items-center gap-2 px-4 py-3 border-r border-dashed border-gray-200">
          <MapPin size={11} className="text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-500 truncate">{field}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <TrendingUp size={11} className="text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-500">
            {n(area)} · {n(crop.expectedYield)}
          </span>
        </div>
      </div>

      {/* Progress */}
      {status === "growing" || status === "seedling" ? (
        <div className="px-5 py-4 border-b border-dashed border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
              {t("planner.growth")}
            </span>
            <span
              className="font-mono text-[10px] font-bold"
              style={{ color: accent }}
            >
              {n(progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                delay: delay + 0.3,
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
              }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
            {n(daysLeft)} days to harvest
          </p>
        </div>
      ) : null}

      {/* Timeline */}
      <div className="px-5 py-3 border-b border-dashed border-gray-200">
        <div className="flex justify-between mb-2">
          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
            {t("planner.timeline")}
          </span>
          <div className="flex items-center gap-2.5 text-[9px] text-gray-400">
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-1.5 rounded-sm inline-block border border-dashed"
                style={{ borderColor: accent }}
              />
              Sow
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-1.5 rounded-sm inline-block"
                style={{ background: accent }}
              />
              Harvest
            </span>
          </div>
        </div>
        <TimelineBar
          {...{ sowStart, sowEnd, harvestStart, harvestEnd, accent }}
        />
        <div className="flex justify-between mt-1">
          {MONTHS.map((m, i) => (
            <span
              key={m}
              className={`text-[8px] font-mono ${i === CURRENT_MONTH ? "font-bold text-emerald-600" : "text-gray-300"}`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Tasks preview */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
            {t("planner.tasks")}
          </span>
          <span className="font-mono text-[9px] text-gray-400">
            {n(pendingTasks)} pending
          </span>
        </div>
        <div className="space-y-1.5">
          {tasks.slice(0, 2).map((t, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className={`w-4 h-4 rounded-full border border-dashed flex items-center justify-center shrink-0
                ${t.done ? "bg-emerald-50 border-emerald-300" : t.urgent ? "border-red-300" : "border-gray-300"}`}
              >
                {t.done && (
                  <CheckCircle2 size={10} className="text-emerald-500" />
                )}
                {!t.done && t.urgent && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
              </div>
              <span
                className={`text-[11px] flex-1 ${t.done ? "line-through text-gray-300" : "text-gray-600"}`}
              >
                {t.label}
              </span>
              <span className="font-mono text-[9px] text-gray-400">
                {t.due}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   DETAIL PANEL
───────────────────────────────────────── */
const DetailPanel = ({ crop, onClose }) => {
  const { t, n } = useLanguage();
  const [tasks, setTasks] = useState(crop.tasks);
  const {
    name,
    variety,
    field,
    icon: Icon,
    accent,
    light,
    border,
    text,
    area,
    expectedYield,
    waterNeed,
    conditions,
    status,
  } = crop;
  const sm = STATUS_META[status];

  const toggleTask = (i) =>
    setTasks((ts) =>
      ts.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)),
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-xl overflow-hidden sticky top-6"
    >
      <div
        className="h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}50)` }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl ${light} border border-dashed ${border} flex items-center justify-center ${text}`}
          >
            <Icon size={16} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {name}{" "}
              <span className="text-gray-400 font-normal">· {variety}</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{field}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 border-b border-dashed border-gray-200 ">
        {[
          { label: "Area", value: area, icon: MapPin },
          { label: t("planner.yield"), value: expectedYield, icon: TrendingUp },
          { label: "Water", value: waterNeed, icon: Droplets },
        ].map(({ label, value, icon: I }, i) => (
          <div
            key={label}
            className={`p-4 flex flex-col gap-1 ${i < 2 ? "border-r border-dashed border-gray-200" : ""}`}
          >
            <div className="flex items-center gap-1.5">
              <I size={10} className="text-gray-400" />
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                {label}
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-gray-800">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Weather conditions */}
      <div className="px-5 py-4 border-b border-dashed border-gray-200">
        <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-3">
          Field Conditions
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Temp",
              value: conditions.temp,
              icon: Thermometer,
              color: "text-orange-500",
            },
            {
              label: "Rain",
              value: conditions.rain,
              icon: CloudRain,
              color: "text-blue-400",
            },
            {
              label: "Sun",
              value: conditions.sun,
              icon: Sun,
              color: "text-amber-500",
            },
          ].map(({ label, value, icon: I, color }) => (
            <div
              key={label}
              className={`bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 flex flex-col items-center gap-1`}
            >
              <I size={14} className={color} />
              <span className="font-mono text-xs font-bold text-gray-700">
                {value}
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="px-5 py-4 border-b border-dashed border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
            Task Checklist
          </p>
          <button
            className="flex items-center gap-1 text-[9px] font-bold"
            style={{ color: accent }}
          >
            <Plus size={10} /> Add Task
          </button>
        </div>
        <div className="space-y-2">
          {tasks.map((t, i) => (
            <button
              key={i}
              onClick={() => toggleTask(i)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 border border-dashed border-gray-100 hover:border-gray-300 transition-colors text-left group"
            >
              <div
                className={`w-5 h-5 rounded-full border border-dashed flex items-center justify-center shrink-0 transition-colors
                ${t.done ? "bg-emerald-50 border-emerald-400" : t.urgent ? "border-red-300 group-hover:border-red-400" : "border-gray-300 group-hover:border-gray-400"}`}
              >
                {t.done ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : t.urgent ? (
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-200" />
                )}
              </div>
              <span
                className={`text-xs flex-1 ${t.done ? "line-through text-gray-300" : "text-gray-600 font-medium"}`}
              >
                {t.label}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Clock size={9} className="text-gray-300" />
                <span className="font-mono text-[9px] text-gray-400">
                  {t.due}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-200">
        <button className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors border-b-0">
          <Edit2 size={12} /> Edit Crop
        </button>
        <button className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold text-red-400 hover:bg-red-50 transition-colors">
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   ADD CROP MODAL
───────────────────────────────────────── */
const AddCropModal = ({ onClose }) => {
  const [form, setForm] = useState({
    name: "",
    variety: "",
    field: "",
    area: "",
    sowMonth: "",
    harvestMonth: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-dashed border-emerald-200 flex items-center justify-center text-emerald-600">
              <img src="./logo-brows.png" alt="Icon" className="w-4 h-4" />
            </div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
              Add New Crop
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-200 border-b border-dashed border-gray-200">
          {[
            { label: "Crop Name", key: "name", placeholder: "e.g. Wheat" },
            { label: "Variety", key: "variety", placeholder: "e.g. HD-2967" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="p-4 flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-b border-dashed border-gray-200">
          <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1.5">
            Field / Location
          </label>
          <select
            value={form.field}
            onChange={set("field")}
            className="w-full text-sm font-semibold text-gray-700 outline-none bg-transparent"
          >
            <option value="">Select field…</option>
            {FIELDS.slice(1).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 divide-x divide-dashed divide-gray-200 border-b border-dashed border-gray-200">
          {[
            { label: "Area (ha)", key: "area", placeholder: "0.0" },
            { label: "Sow Month", key: "sowMonth", placeholder: "e.g. Mar" },
            {
              label: "Harvest Month",
              key: "harvestMonth",
              placeholder: "e.g. Sep",
            },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="p-4 flex flex-col gap-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="text-sm font-semibold text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-200">
          <button
            onClick={onClose}
            className="py-3.5 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button className="py-3.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Plus size={12} /> Add Crop
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function CropPlanner() {
  const { t, n } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState(1);
  const [filterField, setFilterField] = useState("All Fields");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = CROPS.filter(
    (c) =>
      (filterField === "All Fields" || c.field === filterField) &&
      (filterStatus === "All" || c.status === filterStatus),
  );

  const selected = CROPS.find((c) => c.id === selectedCrop);

  const stats = [
    {
      label: "Total Crops",
      value: n(CROPS.length),
      mono: true,
      color: "text-gray-900",
    },
    {
      label: "Active Plots",
      value: n("23.4") + " ha",
      mono: true,
      color: "text-emerald-700",
    },
    {
      label: "Pending Tasks",
      value: n(CROPS.flatMap((c) => c.tasks).filter((t) => !t.done).length),
      mono: true,
      color: "text-amber-700",
    },
    {
      label: "Harvest Soon",
      value: n(2) + " crops",
      mono: false,
      color: "text-blue-700",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500;600&family=Cormorant+Garamond:wght@600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-mono { font-family: 'DM Mono', monospace !important; }
        .dashed-bg { background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 36px 36px; }
      `}</style>

      <div className="min-h-screen bg-stone-50 dashed-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {/* ── PAGE HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 mt-19"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf size={12} className="text-emerald-500" />
                <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-600 font-bold">
                  2024 Season
                </span>
              </div>
              <h1 className="font-display text-5xl font-bold text-gray-900 leading-none tracking-tight">
                {t("planner.pageTitle")}
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                Plan, schedule and track your crops from sow to harvest.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold tracking-wide hover:bg-gray-800 active:scale-95 transition-all shrink-0"
            >
              <Plus size={14} /> Add New Crop
            </button>
          </motion.div>

          {/* ── STAT STRIP ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-2 sm:grid-cols-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden  mb-6"
          >
            {stats.map(({ label, value, mono, color }, i) => (
              <div
                key={label}
                className={`p-5 ${i < stats.length - 1 ? "border-r border-dashed border-gray-200" : ""}`}
              >
                <p className="text-[9px] uppercase tracking-[0.12em] text-gray-400 font-bold mb-2">
                  {label}
                </p>
                <p
                  className={`text-2xl font-bold leading-none ${mono ? "font-mono" : ""} ${color}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* ── WEATHER STRIP ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6"
          >
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-dashed border-gray-200">
              <Sun size={13} className="text-amber-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                5-Day Forecast · Main Farm
              </span>
            </div>
            <div className="grid grid-cols-5 divide-x divide-dashed divide-gray-200">
              {WEATHER.map(({ day, icon: WIcon, temp, rain, color }) => (
                <div
                  key={day}
                  className="flex flex-col items-center gap-1.5 py-4"
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">
                    {day}
                  </span>
                  <WIcon size={18} className={color} strokeWidth={1.8} />
                  <span className="font-mono text-sm font-bold text-gray-800">
                    {n(temp)}
                  </span>
                  <div className="flex items-center gap-1">
                    <CloudRain size={9} className="text-blue-300" />
                    <span className="font-mono text-[10px] text-gray-400">
                      {n(rain)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── FILTERS ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <div className="flex items-center gap-2 bg-white rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500">
              <Filter size={11} />
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="bg-transparent outline-none font-semibold text-gray-700 text-xs cursor-pointer"
              >
                {FIELDS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-1.5 overflow-auto">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl border border-dashed text-[10px] font-bold uppercase tracking-wider transition-all
                    ${filterStatus === s ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 bg-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <span className="ml-auto font-mono text-[11px] text-gray-400">
              {n(filtered.length)} crops
            </span>
          </motion.div>

          {/* ── MAIN GRID ── */}
          <div
            className={`grid gap-5 transition-all duration-300 ${selected ? "grid-cols-1 lg:grid-cols-[1fr_340px]" : "grid-cols-1"}`}
          >
            {/* Left — crop cards */}
            <div
              className={`grid gap-4 content-start ${selected ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"}`}
            >
              <AnimatePresence>
                {filtered.map((crop, i) => (
                  <CropCard
                    key={crop.id}
                    crop={crop}
                    onSelect={setSelectedCrop}
                    selected={selectedCrop}
                    delay={i * 0.07}
                  />
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white"
                >
                  <Sprout size={28} className="text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-400">
                    No crops match this filter
                  </p>
                  <button
                    onClick={() => {
                      setFilterField("All Fields");
                      setFilterStatus("All");
                    }}
                    className="text-xs text-emerald-600 hover:underline mt-2"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right — detail panel */}
            <AnimatePresence>
              {selected && (
                <DetailPanel
                  key={selected.id}
                  crop={selected}
                  onClose={() => setSelectedCrop(null)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* ── SEASON MASTER TIMELINE ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-stone-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-500">
                  <Calendar size={13} />
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">
                  Season Overview · 2024
                </span>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-sm inline-block border border-dashed border-gray-400" />
                  Sow
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-sm inline-block bg-gray-500 opacity-60" />
                  Harvest
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-0.5 h-3 inline-block bg-emerald-500 rounded-full" />
                  Now
                </span>
              </div>
            </div>

            {/* Month header */}
            <div
              className="grid border-b border-dashed border-gray-200"
              style={{ gridTemplateColumns: "160px 1fr" }}
            >
              <div className="px-4 py-2.5 border-r border-dashed border-gray-200">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                  Crop
                </span>
              </div>
              <div className="grid grid-cols-12 px-2">
                {MONTHS.map((m, i) => (
                  <div
                    key={m}
                    className={`text-center py-2.5 border-r border-dashed border-gray-100 last:border-r-0 ${i === CURRENT_MONTH ? "bg-emerald-50/60" : ""}`}
                  >
                    <span
                      className={`text-[9px] font-mono font-bold ${i === CURRENT_MONTH ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      {m}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop rows */}
            {CROPS.map((crop, idx) => (
              <div
                key={crop.id}
                className={`grid border-b border-dashed border-gray-100 last:border-b-0 ${idx % 2 === 1 ? "bg-gray-50/30" : ""}`}
                style={{ gridTemplateColumns: "160px 1fr" }}
              >
                <div className="flex items-center gap-2.5 px-4 py-4 border-r border-dashed border-gray-200">
                  <div className={`w-1.5 h-1.5 rounded-full ${crop.dot}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {crop.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {crop.variety}
                    </p>
                  </div>
                </div>
                <div className="px-2 flex items-center">
                  <div className="relative flex-1 h-7">
                    {MONTHS.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          left: `${(i / 12) * 100}%`,
                          width: `${(1 / 12) * 100}%`,
                        }}
                        className={`absolute top-0 bottom-0 border-r border-dashed border-gray-100 ${i === CURRENT_MONTH ? "bg-emerald-50/40" : ""}`}
                      />
                    ))}
                    {/* sow */}
                    <div
                      className="absolute top-1.5 bottom-1.5 rounded-full border-2 border-dashed opacity-70"
                      style={{
                        left: `${(crop.sowStart / 12) * 100}%`,
                        width: `${((crop.sowEnd - crop.sowStart) / 12) * 100}%`,
                        borderColor: crop.accent,
                        background: crop.accent + "20",
                      }}
                    />
                    {/* harvest */}
                    <div
                      className="absolute top-1.5 bottom-1.5 rounded-full opacity-80"
                      style={{
                        left: `${(crop.harvestStart / 12) * 100}%`,
                        width: `${((crop.harvestEnd - crop.harvestStart) / 12) * 100}%`,
                        background: crop.accent,
                      }}
                    />
                    {/* now line */}
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-emerald-500 z-10 rounded-full"
                      style={{ left: `${((CURRENT_MONTH + 0.5) / 12) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── ADD CROP MODAL ── */}
      <AnimatePresence>
        {showModal && <AddCropModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
