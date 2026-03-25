import React from "react";
import { motion } from "framer-motion";
import { Zap, Crown, Sprout, CheckCircle2 } from "lucide-react";

/**
 * PlanBadge Component - Displays user's active subscription plan
 * Used throughout the app to show current plan status
 */
const PlanBadge = ({ 
  planId = "free", 
  planName = "Free",
  showIcon = true,
  size = "md",
  compact = false,
  animate = true 
}) => {
  const planConfig = {
    free: {
      icon: Sprout,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      accentColor: "#10b981",
      label: "Free"
    },
    premium: {
      icon: Zap,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      accentColor: "#f59e0b",
      label: "Premium"
    },
    superPremium: {
      icon: Crown,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      accentColor: "#a855f7",
      label: "Super Premium"
    }
  };

  const config = planConfig[planId] || planConfig.free;
  const Icon = config.icon;

  const sizeConfig = {
    sm: { padding: "px-2 py-1", text: "text-[10px]", icon: 12 },
    md: { padding: "px-3 py-1.5", text: "text-[12px]", icon: 14 },
    lg: { padding: "px-4 py-2", text: "text-[14px]", icon: 16 }
  };

  const style = sizeConfig[size] || sizeConfig.md;

  if (compact) {
    return (
      <motion.div
        initial={animate ? { scale: 0.9, opacity: 0 } : {}}
        animate={animate ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor} ${style.padding} font-medium ${style.text} whitespace-nowrap`}
      >
        {showIcon && <Icon size={style.icon} strokeWidth={2} />}
        <span>{config.label}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animate ? { scale: 0.9, opacity: 0 } : {}}
      animate={animate ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor} ${style.padding}`}
    >
      {showIcon && (
        <div className="flex-shrink-0">
          <Icon size={style.icon} strokeWidth={2} />
        </div>
      )}
      <div className="flex flex-col">
        <span className={`${style.text} font-semibold`}>{config.label}</span>
        {planName && <span className={`${style.text} opacity-70`}>{planName}</span>}
      </div>
    </motion.div>
  );
};

export default PlanBadge;
