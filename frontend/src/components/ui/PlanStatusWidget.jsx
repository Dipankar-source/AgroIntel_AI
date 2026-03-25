import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Crown,
  Sprout,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PlanStatusWidget - Displays user's current subscription status
 * Shows plan details, expiry date, and action buttons
 * Used on Dashboard/Home page
 */
const PlanStatusWidget = ({ user, compact = false }) => {
  const navigate = useNavigate();
  
  if (!user?.activePlan) return null;

  const { activePlan } = user;
  
  const planConfig = {
    free: {
      icon: Sprout,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      accentColor: "#10b981",
      textColor: "text-emerald-700",
      label: "Free Plan",
    },
    premium: {
      icon: Zap,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      accentColor: "#f59e0b",
      textColor: "text-amber-700",
      label: "Premium Plan",
    },
    superPremium: {
      icon: Crown,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      accentColor: "#a855f7",
      textColor: "text-purple-700",
      label: "Super Premium Plan",
    },
  };

  const config = planConfig[activePlan.planId] || planConfig.free;
  const Icon = config.icon;

  // Calculate days until renewal/expiry
  const now = new Date();
  const endDate = new Date(activePlan.endDate);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysRemaining < 0;

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg border ${config.bgColor} ${config.borderColor} p-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: config.accentColor + "20" }}
            >
              <Icon size={20} style={{ color: config.accentColor }} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${config.textColor}`}>
                {activePlan.planName}
              </p>
              {!isExpired && activePlan.planId !== "free" && (
                <p className="text-xs opacity-70">
                  Expires {formatDate(activePlan.endDate)}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => navigate("/subscription")}
            className={`rounded-full p-2 hover:opacity-80 transition-opacity`}
            style={{ backgroundColor: config.accentColor + "20" }}
          >
            <ChevronRight
              size={18}
              style={{ color: config.accentColor }}
            />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border ${config.bgColor} ${config.borderColor} overflow-hidden`}
    >
      {/* Header with gradient effect */}
      <div
        style={{
          background: `linear-gradient(135deg, ${config.accentColor}15, ${config.accentColor}05)`,
        }}
        className="px-6 py-5"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: config.accentColor + "25" }}
            >
              <Icon size={28} style={{ color: config.accentColor }} />
            </motion.div>
            <div>
              <h3 className={`text-2xl font-bold ${config.textColor}`}>
                {activePlan.planName}
              </h3>
              <p className="text-sm opacity-70 mt-1">Current subscription</p>
            </div>
          </div>

          {/* Status badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium ${
              isExpired
                ? "bg-red-100 text-red-700"
                : activePlan.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {isExpired ? (
              <>
                <AlertCircle size={14} />
                Expired
              </>
            ) : activePlan.status === "active" ? (
              <>
                <CheckCircle2 size={14} />
                Active
              </>
            ) : (
              <>
                <Clock size={14} />
                {activePlan.status.charAt(0).toUpperCase() +
                  activePlan.status.slice(1)}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Details section */}
      <div className="px-6 py-4 border-t" style={{ borderColor: config.accentColor + "30" }}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Billing Cycle */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Billing Cycle</p>
            <p className="text-sm font-medium text-gray-700">
              {activePlan.billingCycle === "annual"
                ? "Annual (Yearly)"
                : "Monthly"}
            </p>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
            <p className="text-sm font-medium text-gray-700">
              ₹{activePlan.totalPrice?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Started</p>
            <p className="text-sm font-medium text-gray-700">
              {formatDate(activePlan.startDate)}
            </p>
          </div>

          {/* End Date */}
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {isExpired ? "Expired" : "Renews"}
            </p>
            <p className="text-sm font-medium text-gray-700">
              {formatDate(activePlan.endDate)}
            </p>
          </div>
        </div>

        {/* Renewal info */}
        {!isExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 p-3 rounded-lg bg-white/50 border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {daysRemaining > 0 ? (
                  <>
                    <span className="font-medium text-gray-700">
                      {daysRemaining}
                    </span>
                    {" days remaining"}
                  </>
                ) : (
                  "Plan expired - Please renew"
                )}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t" style={{ borderColor: config.accentColor + "20" }}>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/subscription")}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            style={{
              backgroundColor: config.accentColor,
              color: "white",
            }}
          >
            <Zap size={16} />
            {activePlan.planId === "free" ? "Upgrade Plan" : "Change Plan"}
          </motion.button>

          {activePlan.planId !== "free" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/subscription")}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm border-2 transition-colors"
              style={{
                borderColor: config.accentColor,
                color: config.accentColor,
                backgroundColor: "transparent",
              }}
            >
              Manage
            </motion.button>
          )}
        </div>
      </div>

      {/* Payment status indicator */}
      {activePlan.paymentStatus !== "completed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-6 py-3 bg-amber-50 border-t border-amber-200"
        >
          <p className="text-xs text-amber-700">
            ⚠️ Payment status: {activePlan.paymentStatus}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlanStatusWidget;
