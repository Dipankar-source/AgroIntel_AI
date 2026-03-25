// src/pages/Subscription.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Zap,
  Sprout,
  Crown,
  ShieldCheck,
  RefreshCcw,
  Globe,
  Ban,
  BadgeCheck,
  Star,
  TrendingUp,
  Layers,
  Users,
  BarChart2,
  Cpu,
  Headphones,
  Calendar,
  CloudUpload,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

// FIX: Create this file or import from correct path
import { PLANS } from "../assets/plan";

/* ─── Font injection ─── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .font-cormorant { font-family: 'Cormorant Garamond', serif; }
    .font-dm        { font-family: 'DM Sans', sans-serif; }
    * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

    .dashed-grid {
      background-image:
        linear-gradient(rgba(22,163,74,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(22,163,74,0.05) 1px, transparent 1px);
      background-size: 36px 36px;
    }
    :is(.dark) .dashed-grid {
      background-image:
        linear-gradient(rgba(22,163,74,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(22,163,74,0.03) 1px, transparent 1px);
    }

    .btn-shadow-green {
      box-shadow: 0 6px 24px rgba(22,163,74,0.38), 0 2px 8px rgba(22,163,74,0.22);
      transition: box-shadow 0.22s ease, transform 0.18s ease;
    }
    .btn-shadow-green:hover {
      box-shadow: 0 10px 36px rgba(22,163,74,0.52), 0 4px 14px rgba(22,163,74,0.30);
      transform: translateY(-2px);
    }

    .btn-shadow-outline {
      box-shadow: 0 4px 16px rgba(22,163,74,0.14), 0 1px 4px rgba(22,163,74,0.10);
      transition: box-shadow 0.22s ease, transform 0.18s ease;
    }
    .btn-shadow-outline:hover {
      box-shadow: 0 8px 28px rgba(22,163,74,0.24), 0 3px 10px rgba(22,163,74,0.16);
      transform: translateY(-2px);
    }

    .toggle-pill {
      transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
    }
  `}</style>
);

/* ─── Animated feature icon ─── */
const FeatureIcon = ({ Icon, accent, isActive }) => (
  <span
    className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: `${accent}22` }}
  >
    <Icon
      size={9}
      strokeWidth={isActive ? 2.8 : 2.2}
      style={{ color: accent }}
    />
  </span>
);

/* ─── Feature check row ─── */
const Feature = ({ item, accent, isActive, isDark }) => (
  <motion.div
    className="flex items-start gap-2.5 py-1"
    whileHover={{ x: 3 }}
    transition={{ duration: 0.18 }}
  >
    <FeatureIcon Icon={item.icon} accent={accent} isActive={isActive} />
    <span
      className={`font-dm text-[13px] leading-snug ${
        isActive
          ? isDark ? "text-gray-200" : "text-gray-700"
          : isDark ? "text-gray-300" : "text-gray-500"
      }`}
    >
      {item.text}
    </span>
  </motion.div>
);

/* ─── Active badge ─── */
const ActiveBadge = ({ t }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500 text-white"
    style={{ boxShadow: "0 2px 10px rgba(22,163,74,0.50)" }}
  >
    <BadgeCheck
      size={11}
      strokeWidth={2.5}
      style={{ color: "white" }}
    />
    <span className="font-dm text-[10px] font-semibold uppercase tracking-[0.12em]">
      {t("subscription.currentPlanBadge")}
    </span>
  </motion.div>
);

/* ─── Single plan card ─── */
const PlanCard = ({
  plan,
  annual,
  index,
  isActive,
  isDowngrade,
  isPurchasable,
  onSelect,
  t,
  n,
  isDark,
}) => {
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const Icon = plan.icon;
  const [hovered, setHovered] = useState(false);

  const getCtaLabel = () => {
    if (isActive) return t("subscription.currentPlanBadge");
    if (isDowngrade) return t("subscription.downgrade");
    return plan.cta;
  };

  const handleClick = () => {
    if (!isActive && !isDowngrade && isPurchasable) {
      onSelect(plan, annual);
    }
  };

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`
        rounded-[24px] border overflow-hidden h-full flex flex-col transition-shadow duration-300
        ${!isActive && !isDowngrade && isPurchasable ? "cursor-pointer" : "cursor-default"}
      `}
      style={{
        backgroundColor: isActive
          ? isDark ? "rgba(22,101,52,0.25)" : "rgba(240,253,244,0.95)"
          : isDark ? "rgba(30,41,59,0.95)" : "white",
        borderColor: isActive
          ? isDark ? "#22c55e" : "#16a34a"
          : plan.featured
            ? isDark ? `${plan.accent}55` : `${plan.accent}44`
            : isDark ? "#374151" : "#e5e7eb",
        borderWidth: isActive ? "2px" : plan.featured ? "1.5px" : "1px",
        boxShadow: isActive
          ? isDark ? "0 4px 24px rgba(22,163,74,0.15)" : "0 4px 24px rgba(22,163,74,0.12)"
          : plan.featured
            ? isDark ? "0 4px 20px rgba(5,150,105,0.12)" : "0 8px 32px rgba(5,150,105,0.10)"
            : isDark ? "0 2px 12px rgba(0,0,0,0.20)" : "0 2px 12px rgba(0,0,0,0.04)",
      }}
      onClick={handleClick}
    >
      {/* Top accent strip */}
      <div
        className="h-1.5 w-full"
        style={{
          background: isActive
            ? `linear-gradient(90deg, #16a34a, #22c55e, #059669)`
            : `linear-gradient(90deg, ${plan.accent}00, ${plan.accent}, ${plan.accent}00)`,
        }}
      />

      <div className="px-6 pt-5 pb-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon with animation */}
          <div className="relative">
            <motion.div
              className="w-11 h-11 rounded-[13px] flex items-center justify-center relative"
              style={{
                backgroundColor: isActive
                  ? isDark ? `${plan.accent}33` : `${plan.accent}22`
                  : isDark ? `${plan.accent}22` : plan.accentLight,
                color: plan.accent,
              }}
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Icon
                size={20}
                style={{ color: plan.accent }}
                strokeWidth={1.8}
              />
            </motion.div>
          </div>

          {isActive ? (
            <ActiveBadge t={t} />
          ) : (
            <span
              className="font-dm text-[10px] uppercase tracking-[0.16em] font-medium px-2.5 py-1 rounded-full"
              style={{
                color: plan.accent,
                backgroundColor: isDark ? `${plan.accent}22` : plan.accentLight,
                border: `1px solid ${plan.accent}30`,
              }}
            >
              {plan.tag}
            </span>
          )}
        </div>

        {/* Plan name */}
        <h3
          className={`font-cormorant text-[1.7rem] font-bold leading-none mb-1 ${
            isActive
              ? isDark ? "text-green-400" : "text-green-700"
              : isDark ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {plan.name}
        </h3>
        <p className={`font-dm text-[12.5px] font-light mb-5 leading-snug ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {plan.desc}
        </p>

        {/* Price */}
        <div className="flex items-end gap-1 mb-1">
          <span
            className={`font-cormorant text-[2.8rem] font-bold leading-none ${
              isActive
                ? isDark ? "text-green-400" : "text-green-700"
                : isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {price === 0
              ? `₹${n(price.toLocaleString("en-IN"))}.${n("00")}`
              : `₹${n(price.toLocaleString("en-IN"))}`}
          </span>
          {price > 0 && (
            <span className={`font-dm text-[13px] mb-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {t("subscription.perMonth")}
            </span>
          )}
        </div>
        {annual && plan.monthlyPrice > 0 && (
          <p className={`font-dm text-[11px] font-medium mb-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            {t("subscription.annualSaving", { amount: n(((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString("en-IN")) })}
          </p>
        )}
        {(!annual || plan.monthlyPrice === 0) && <div className="mb-5" />}

        {/* Active plan highlight bar */}
        {isActive && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 h-1 rounded-full"
            style={{
              background: "linear-gradient(90deg, #16a34a, #22c55e, #059669)",
              transformOrigin: "left",
            }}
          />
        )}

        {/* Divider dashed */}
        {!isActive && (
          <div
            className="mb-5 border-t border-dashed"
            style={{ borderColor: `${plan.accent}30` }}
          />
        )}

        {/* Features */}
        <div className="flex-1 space-y-0.5 mb-6">
          {plan.features.map((f) => (
            <Feature
              key={f.text}
              item={f}
              accent={plan.accent}
              isActive={isActive}
              isDark={isDark}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={isActive || isDowngrade ? {} : { scale: 1.03 }}
          whileTap={isActive || isDowngrade ? {} : { scale: 0.97 }}
          className={`
            w-full py-3 rounded-[14px] font-dm font-semibold text-[13.5px]
            flex items-center justify-center gap-2
            ${
              isActive
                ? isDark ? "bg-green-900/30 text-green-400 cursor-default" : "bg-green-50 text-green-700 cursor-default"
                : isDowngrade
                  ? isDark ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : plan.featured
                    ? "text-white btn-shadow-green cursor-pointer"
                    : isDark ? "text-gray-200 btn-shadow-outline bg-gray-700 cursor-pointer" : "text-gray-700 btn-shadow-outline bg-white cursor-pointer"
            }
          `}
          style={
            isActive || isDowngrade
              ? {
                  boxShadow: "none",
                  border: isActive
                    ? isDark ? "1px solid #166534" : "1px solid #bbf7d0"
                    : isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                }
              : plan.featured
                ? {
                    background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}cc)`,
                    border: "none",
                  }
                : { border: isDark ? "1px solid #374151" : "1px solid #e5e7eb" }
          }
          onClick={handleClick}
        >
          {isActive ? (
            <>
              <BadgeCheck size={14} strokeWidth={2.5} />
              {getCtaLabel()}
            </>
          ) : (
            <>
              {getCtaLabel()}
              {!isDowngrade && (
                <motion.span
                  animate={hovered ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 0.5, repeat: hovered ? Infinity : 0 }}
                >
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </motion.span>
              )}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  return inner;
};

/* ─── Animated trust icons ─── */
const TrustItem = ({ icon: Icon, text, animClass, color = "#16a34a", isDark }) => (
  <motion.div
    className="flex items-center gap-2"
    whileHover={{ y: -2, scale: 1.03 }}
    transition={{ duration: 0.18 }}
  >
    <Icon size={15} style={{ color }} strokeWidth={1.8} />
    <span className={`font-dm text-[12px] ${isDark ? "text-gray-400" : "text-gray-400"}`}>{text}</span>
  </motion.div>
);

/* ════════════════════════════════════
   MAIN SUBSCRIPTION PAGE
════════════════════════════════════ */
// Updated to use user from context and activePlan field
const Subscription = () => {
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const { t, n } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Get the current plan ID from user's activePlan
  const userPlan = user?.activePlan?.planId || "free";

  // FIX: Ensure planOrder matches your plan IDs
  const planOrder = { free: 0, premium: 1, superPremium: 2 };
  const currentPlanIndex = planOrder[userPlan] ?? 0;

  const handlePlanSelect = (plan, isAnnual) => {
    // Guard already applied in PlanCard via isPurchasable — navigate directly
    navigate("/billing", {
      state: {
        selectedPlanId: plan.id,
        isAnnual: isAnnual,
        currentPlan: userPlan,
        currentActivePlan: user?.activePlan,
      },
    });
  };

  return (
    <>
      <FontStyle />
      <div className={`relative min-h-screen overflow-hidden dashed-grid ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"
          : "bg-gradient-to-br from-green-50 via-white to-emerald-50"
      }`}>
        {/* Blur blobs */}
        <div
          className="absolute w-96 h-96 rounded-full blur-[120px] -top-24 -left-24 pointer-events-none"
          style={{ backgroundColor: "rgba(22,163,74,0.13)" }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-[100px] -bottom-20 -right-20 pointer-events-none"
          style={{ backgroundColor: "rgba(5,150,105,0.10)" }}
        />
        <div
          className="absolute w-64 h-64 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ backgroundColor: "rgba(13,148,136,0.07)" }}
        />

        {/* Floating animated background icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            {
              Icon: Sprout,
              top: "8%",
              left: "4%",
              size: 22,
              delay: 0,
              opacity: 0.12,
            },
            {
              Icon: Zap,
              top: "20%",
              right: "6%",
              size: 18,
              delay: 0.5,
              opacity: 0.1,
            },
            {
              Icon: Star,
              bottom: "25%",
              left: "8%",
              size: 14,
              delay: 1.0,
              opacity: 0.09,
            },
            {
              Icon: TrendingUp,
              top: "60%",
              right: "4%",
              size: 20,
              delay: 1.5,
              opacity: 0.1,
            },
            {
              Icon: Crown,
              bottom: "10%",
              right: "12%",
              size: 16,
              delay: 0.8,
              opacity: 0.08,
            },
          ].map(
            ({ Icon, top, left, right, bottom, size, delay, opacity }, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ top, left, right, bottom, opacity }}
                animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0] }}
                transition={{
                  duration: 5 + i,
                  delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Icon size={size} color="#16a34a" strokeWidth={1.5} />
              </motion.div>
            ),
          )}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            <div
              className={`inline-flex items-center gap-2 mt-5 px-4 py-1.5 rounded-full border mb-5 ${
                isDark ? "border-green-800 bg-gray-800/70" : "border-green-200 bg-white/70"
              }`}
              style={{ boxShadow: "0 2px 12px rgba(22,163,74,0.10)" }}
            >
              <Sprout size={13} className="text-green-600" />
              <span className={`font-dm text-[11px] uppercase tracking-[0.16em] font-medium ${isDark ? "text-green-400" : "text-green-700"}`}>
                {t("subscription.simpleTitle")}
              </span>
            </div>

            <h1 className={`font-cormorant text-[3.4rem] font-bold leading-[1.04] tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
              {t("subscription.heading")}
            </h1>
            <p className={`font-dm font-light text-[15px] max-w-md mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {t("subscription.description")}
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border ${isDark ? "bg-green-900/30 border-green-800" : "bg-green-50 border-green-200"}`}
            >
              <BadgeCheck size={13} className="text-green-600" />
              <span className={`font-dm text-[12px] font-medium ${isDark ? "text-green-400" : "text-green-700"}`}>
                {t("subscription.currentPlan", { plan: PLANS.find((p) => p.id === userPlan)?.name || userPlan })}
              </span>
            </motion.div>
          </motion.div>

          {/* ── Billing toggle ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <span
              className={`font-dm text-[13px] font-medium transition-colors ${
                !annual
                  ? isDark ? "text-gray-200" : "text-gray-700"
                  : isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {t("common.monthly")}
            </span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className="relative w-12 h-6 rounded-full cursor-pointer border-none transition-colors duration-300"
              style={{
                backgroundColor: annual ? "#16a34a" : "#d1d5db",
                boxShadow: annual ? "0 2px 10px rgba(22,163,74,0.35)" : "none",
              }}
            >
              <motion.span
                animate={{ x: annual ? 24 : 2 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full block toggle-pill"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }}
              />
            </button>
            <span
              className={`font-dm text-[13px] font-medium transition-colors ${
                annual
                  ? isDark ? "text-gray-200" : "text-gray-700"
                  : isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {t("common.annual")}
            </span>
            <AnimatePresence>
              {annual && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className={`font-dm text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? "text-emerald-400 bg-emerald-900/30 border-emerald-700" : "text-emerald-600 bg-emerald-50 border-emerald-200"}`}
                >
                  {t("subscription.saveUpTo")}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Plan grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan, i) => {
              const thisPlanIndex = planOrder[plan.id] ?? 0;
              const isActive = plan.id === userPlan;
              const isDowngrade = thisPlanIndex < currentPlanIndex;
              const isPurchasable = thisPlanIndex > currentPlanIndex;

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  annual={annual}
                  index={i}
                  isActive={isActive}
                  isDowngrade={isDowngrade}
                  isPurchasable={isPurchasable}
                  onSelect={handlePlanSelect}
                  t={t}
                  n={n}
                  isDark={isDark}
                />
              );
            })}
          </div>

          {/* ── Bottom trust strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <TrustItem
              icon={ShieldCheck}
              text={t("subscription.encryption")}
              animClass="icon-pulse"
              color={isDark ? "#4ade80" : "#16a34a"}
              isDark={isDark}
            />
            <TrustItem
              icon={RefreshCcw}
              text={t("subscription.moneyBack")}
              animClass="icon-spin"
              color={isDark ? "#34d399" : "#059669"}
              isDark={isDark}
            />
            <TrustItem
              icon={Globe}
              text={t("subscription.gdpr")}
              animClass="icon-bounce"
              color={isDark ? "#4ade80" : "#15803d"}
              isDark={isDark}
            />
            <TrustItem
              icon={Ban}
              text={t("subscription.noDataSelling")}
              animClass="icon-wave"
              color={isDark ? "#4ade80" : "#16a34a"}
              isDark={isDark}
            />
          </motion.div>

          {/* ── FAQ teaser ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <p className={`font-dm text-[13px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {t("subscription.questions")}{" "}
              <a
                href="#faq"
                className={`font-medium underline underline-offset-2 transition-colors ${isDark ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}
              >
                {t("subscription.checkFaq")}
              </a>{" "}
              {t("subscription.or")}{" "}
              <a
                href="#contact"
                className={`font-medium underline underline-offset-2 transition-colors ${isDark ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}
              >
                {t("subscription.talkToUs")}
              </a>
              .
            </p>
          </motion.div>

          <p className={`text-center font-dm text-[11px] mt-6 tracking-wide ${isDark ? "text-gray-600" : "text-gray-300"}`}>
            {t("subscription.footerNote")}
          </p>
        </div>
      </div>
    </>
  );
};

export default Subscription;
