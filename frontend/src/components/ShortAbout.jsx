import React from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  Leaf,
  ShieldCheck,
  Globe,
  Sprout,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const getFeatures = (t) => [
  {
    icon: BarChart2,
    title: t("about.aiSoilTitle"),
    desc: t("about.aiSoilDesc"),
    accent: "#16a34a",
    bg: "bg-green-50",
    color: "text-green-600",
  },
  {
    icon: Leaf,
    title: t("about.smartCropTitle"),
    desc: t("about.smartCropDesc"),
    accent: "#059669",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
  {
    icon: Globe,
    title: t("about.marketIntelTitle"),
    desc: t("about.marketIntelDesc"),
    accent: "#0d9488",
    bg: "bg-teal-50",
    color: "text-teal-600",
  },
  {
    icon: ShieldCheck,
    title: t("about.privacyTitle"),
    desc: t("about.privacyDesc"),
    accent: "#15803d",
    bg: "bg-green-50",
    color: "text-green-700",
  },
];

const FeatureCard = ({ feature, index }) => {
  const { icon: Icon, title, desc, bg, color } = feature;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-white rounded-[20px] border border-gray-100 p-6
                 shadow-[0_4px_20px_rgba(0,0,0,0.04)]
                 hover:shadow-[0_8px_32px_rgba(16,185,129,0.10)]
                 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div
        className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} mb-4`}
      >
        <Icon size={19} />
      </div>
      <h3 className="font-cormorant text-[1.2rem] font-bold text-gray-800 leading-tight mb-2">
        {title}
      </h3>
      <p className="font-dm font-light text-gray-500 text-[13px] leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
};

const ShortAbout = () => {
  const navigate = useNavigate();
  const { t, n } = useLanguage();
  const FEATURES = getFeatures(t);

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-12 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6"
      >
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                          bg-green-50 border border-green-100 mb-3"
          >
            <Sprout size={12} className="text-green-600" />
            <span className="font-dm text-[10.5px] text-green-700 font-medium uppercase tracking-widest">
              {t("about.sectionBadge")}
            </span>
          </div>
          <h2
            className="font-cormorant text-[1.9rem] sm:text-[2.4rem] font-bold text-gray-800
                         leading-[1.08] tracking-tight"
          >
            {t("about.headingLine1")}
            <br />
            <span className="text-green-600">{t("about.headingLine2")}</span>
          </h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/about")}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-[13px]
                     border border-gray-200 bg-white text-gray-600
                     font-dm font-medium text-[13px]
                     hover:border-green-200 hover:text-green-700 hover:bg-green-50
                     transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          Learn more <ArrowRight size={13} />
        </motion.button>
      </motion.div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>

      {/* Testimonial strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 p-5 sm:p-6 rounded-[20px]
                   bg-gradient-to-br from-green-700 via-emerald-700 to-green-800
                   border border-white/10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          {[
            { value: n("12,000+"), label: t("about.farmersOnboarded") },
            { value: "₹" + n("2.4") + "Cr", label: t("about.avgSavings") },
            { value: n(38) + " states", label: t("about.acrossIndia") },
          ].map(({ value, label }) => (
            <div key={label} className="text-center sm:text-left">
              <p className="font-cormorant text-[2rem] font-bold text-white leading-none">
                {value}
              </p>
              <p className="font-dm text-[11.5px] text-emerald-300/80 font-light mt-0.5">
                {label}
              </p>
            </div>
          ))}
          <div className="hidden sm:block flex-1" />
          <blockquote className="sm:max-w-xs">
            <p className="font-dm text-[13px] text-emerald-100/90 font-light leading-relaxed italic">
              {t("about.testimonialQuote")}
            </p>
            <p className="font-dm text-[11px] text-emerald-400/70 mt-1.5">
              {t("about.testimonialAuthor")}
            </p>
          </blockquote>
        </div>
      </motion.div>
    </section>
  );
};

export default ShortAbout;
