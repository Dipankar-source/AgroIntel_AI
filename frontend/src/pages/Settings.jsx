import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Sun,
  Moon,
  Bell,
  BellOff,
  Shield,
  Key,
  CreditCard,
  Download,
  Trash2,
  ChevronRight,
  Check,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ─── Toggle Switch ─── */
const Toggle = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${enabled ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-600"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
        ${enabled ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

/* ─── Section Card ─── */
const SectionCard = ({ icon: Icon, title, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm"
  >
    <div className="flex items-start gap-4 mb-5">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="ml-14">{children}</div>
  </motion.div>
);

/* ─── Setting Row ─── */
const SettingRow = ({ label, description, children, danger }) => (
  <div className={`flex items-center justify-between py-3.5 border-b last:border-b-0
    ${danger ? "border-red-100 dark:border-red-900/30" : "border-gray-50 dark:border-gray-800"}`}>
    <div className="pr-4">
      <p className={`text-sm font-semibold ${danger ? "text-red-700 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}>
        {label}
      </p>
      <p className={`text-xs mt-0.5 ${danger ? "text-red-500/70 dark:text-red-400/60" : "text-gray-400 dark:text-gray-500"}`}>
        {description}
      </p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

/* ─── Action Button ─── */
const ActionButton = ({ label, onClick, variant = "default", icon: Icon, comingSoon, comingSoonLabel }) => {
  const base =
    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer";
  const variants = {
    default:
      "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40",
    primary:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
  };

  if (comingSoon) {
    return (
      <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default">
        {comingSoonLabel}
      </span>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {Icon && <Icon size={14} />}
      {label}
      <ChevronRight size={14} className="opacity-40" />
    </button>
  );
};

/* ═══════════════════════════════════════
   MAIN SETTINGS PAGE
═══════════════════════════════════════ */
export default function Settings() {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, deleteAccount } = useUser();
  const navigate = useNavigate();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpStep, setCpStep] = useState("FORM"); // FORM -> OTP -> SUCCESS
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState("");
  const [cpForm, setCpForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [cpOtp, setCpOtp] = useState("");
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);

  // Local notification preference state (UI-only for now — backend doesn't have these fields yet)
  const [notifPrefs, setNotifPrefs] = useState({
    push: true,
    email: true,
    weather: true,
    market: false,
  });

  const [privacyPrefs, setPrivacyPrefs] = useState({
    analytics: true,
    publicProfile: false,
  });

  const handleNotifToggle = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(t("settings.saved"), {
        autoClose: 1500,
        position: "top-right",
        icon: "✅",
      });
      return next;
    });
  };

  const handlePrivacyToggle = (key) => {
    setPrivacyPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(t("settings.saved"), {
        autoClose: 1500,
        position: "top-right",
        icon: "✅",
      });
      return next;
    });
  };

  // ── Change Password handlers ──
  const resetChangePassword = () => {
    setShowChangePassword(false);
    setCpStep("FORM");
    setCpError("");
    setCpForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setCpOtp("");
    setCpShowCurrent(false);
    setCpShowNew(false);
  };

  const handleChangePasswordSendOtp = async (e) => {
    e.preventDefault();
    setCpError("");

    if (cpForm.newPassword.length < 6) {
      setCpError("New password must be at least 6 characters");
      return;
    }
    if (cpForm.newPassword !== cpForm.confirmPassword) {
      setCpError("New passwords do not match");
      return;
    }

    setCpLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/change-password/send-otp`,
        { currentPassword: cpForm.currentPassword },
        { withCredentials: true }
      );
      if (res.data.success) {
        setCpStep("OTP");
        toast.info("OTP sent to your email", { autoClose: 3000, position: "top-right" });
      } else {
        setCpError(res.data.msg || "Failed to send OTP");
      }
    } catch (err) {
      setCpError(err.response?.data?.msg || "Failed to send OTP");
    } finally {
      setCpLoading(false);
    }
  };

  const handleChangePasswordVerify = async (e) => {
    e.preventDefault();
    setCpError("");
    setCpLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/change-password/verify`,
        { otp: cpOtp, newPassword: cpForm.newPassword },
        { withCredentials: true }
      );
      if (res.data.success) {
        setCpStep("SUCCESS");
        toast.success("Password changed successfully!", { autoClose: 3000, position: "top-right", icon: "✅" });
      } else {
        setCpError(res.data.msg || "Verification failed");
      }
    } catch (err) {
      setCpError(err.response?.data?.msg || "Verification failed");
    } finally {
      setCpLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto md:mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("settings.pageTitle")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("settings.pageDesc")}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-5">
          {/* ══════════════════════════════════════
             1. LANGUAGE PREFERENCE
          ══════════════════════════════════════ */}
          <SectionCard
            icon={Globe}
            title={t("settings.languagePreference")}
            description={t("settings.languageDesc")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {supportedLanguages.map((lang) => {
                const isActive = language === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLanguage(lang.code)}
                    className={`relative flex flex-col items-center gap-1.5 px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${
                        isActive
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md shadow-emerald-100 dark:shadow-emerald-900/20"
                          : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {lang.nativeLabel}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {lang.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-medium">
              {t("settings.currentLanguage")}:{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {supportedLanguages.find((l) => l.code === language)?.nativeLabel}
              </span>
            </p>
          </SectionCard>

          {/* ══════════════════════════════════════
             2. APPEARANCE / THEME
          ══════════════════════════════════════ */}
          <SectionCard
            icon={isDark ? Moon : Sun}
            title={t("settings.appearance")}
            description={t("settings.appearanceDesc")}
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Light button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme("light")}
                className={`relative flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${
                    !isDark
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md shadow-amber-100"
                      : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-200"
                  }`}
              >
                {!isDark && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
                <Sun size={22} className={!isDark ? "text-amber-600" : "text-gray-400"} />
                <span className={`font-semibold text-sm ${!isDark ? "text-amber-800" : "text-gray-500 dark:text-gray-400"}`}>
                  {t("settings.lightMode")}
                </span>
              </motion.button>

              {/* Dark button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme("dark")}
                className={`relative flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${
                    isDark
                      ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-md shadow-violet-100 dark:shadow-violet-900/20"
                      : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-200"
                  }`}
              >
                {isDark && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center"
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
                <Moon size={22} className={isDark ? "text-violet-400" : "text-gray-400"} />
                <span className={`font-semibold text-sm ${isDark ? "text-violet-300" : "text-gray-500 dark:text-gray-400"}`}>
                  {t("settings.darkMode")}
                </span>
              </motion.button>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 font-medium">
              {t("settings.currentTheme")}:{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {isDark ? t("settings.darkMode") : t("settings.lightMode")}
              </span>
            </p>
          </SectionCard>

          {/* ══════════════════════════════════════
             3. NOTIFICATIONS
          ══════════════════════════════════════ */}
          <SectionCard
            icon={Bell}
            title={t("settings.notifications")}
            description={t("settings.notificationsDesc")}
          >
            <div>
              <SettingRow
                label={t("settings.pushNotifications")}
                description={t("settings.pushNotificationsDesc")}
              >
                <Toggle
                  enabled={notifPrefs.push}
                  onChange={() => handleNotifToggle("push")}
                />
              </SettingRow>
              <SettingRow
                label={t("settings.emailDigest")}
                description={t("settings.emailDigestDesc")}
              >
                <Toggle
                  enabled={notifPrefs.email}
                  onChange={() => handleNotifToggle("email")}
                />
              </SettingRow>
              <SettingRow
                label={t("settings.weatherAlerts")}
                description={t("settings.weatherAlertsDesc")}
              >
                <Toggle
                  enabled={notifPrefs.weather}
                  onChange={() => handleNotifToggle("weather")}
                />
              </SettingRow>
              <SettingRow
                label={t("settings.marketAlerts")}
                description={t("settings.marketAlertsDesc")}
              >
                <Toggle
                  enabled={notifPrefs.market}
                  onChange={() => handleNotifToggle("market")}
                />
              </SettingRow>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════
             4. PRIVACY & DATA
          ══════════════════════════════════════ */}
          <SectionCard
            icon={Shield}
            title={t("settings.privacy")}
            description={t("settings.privacyDesc")}
          >
            <div>
              <SettingRow
                label={t("settings.shareAnalytics")}
                description={t("settings.shareAnalyticsDesc")}
              >
                <Toggle
                  enabled={privacyPrefs.analytics}
                  onChange={() => handlePrivacyToggle("analytics")}
                />
              </SettingRow>
              <SettingRow
                label={t("settings.showProfile")}
                description={t("settings.showProfileDesc")}
              >
                <Toggle
                  enabled={privacyPrefs.publicProfile}
                  onChange={() => handlePrivacyToggle("publicProfile")}
                />
              </SettingRow>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════
             5. ACCOUNT
          ══════════════════════════════════════ */}
          <SectionCard
            icon={Key}
            title={t("settings.account")}
            description={t("settings.accountDesc")}
          >
            <div className="space-y-2">
              <SettingRow
                label={t("settings.changePassword")}
                description={t("settings.changePasswordDesc")}
              >
                <ActionButton
                  label={t("settings.changePassword")}
                  icon={Key}
                  variant="primary"
                  onClick={() => setShowChangePassword(true)}
                />
              </SettingRow>
              <SettingRow
                label={t("settings.viewSubscription")}
                description={t("settings.viewSubscriptionDesc")}
              >
                <ActionButton
                  label={t("settings.viewSubscription")}
                  icon={CreditCard}
                  variant="primary"
                  onClick={() => navigate("/subscription")}
                />
              </SettingRow>
              <SettingRow
                label={t("settings.exportData")}
                description={t("settings.exportDataDesc")}
              >
                <ActionButton
                  label={t("settings.exportData")}
                  icon={Download}
                  comingSoon
                  comingSoonLabel={t("settings.comingSoon")}
                />
              </SettingRow>
            </div>

            {/* Danger zone */}
            <div className="mt-6 pt-4 border-t border-red-100 dark:border-red-900/30">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                {t("settings.dangerZone")}
              </p>
              <SettingRow
                label={t("settings.deleteAccount")}
                description={t("settings.deleteAccountDesc")}
                danger
              >
                <ActionButton
                  label={t("settings.deleteAccount")}
                  icon={Trash2}
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                />
              </SettingRow>
            </div>
          </SectionCard>
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-emerald-200 dark:border-emerald-800"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Key size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {t("settings.changePassword")}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cpStep === "FORM"
                      ? t("settings.changePasswordDesc")
                      : cpStep === "OTP"
                        ? "Enter the OTP sent to your email"
                        : "Password changed successfully"}
                  </p>
                </div>
              </div>

              {cpError && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  {cpError}
                </div>
              )}

              {cpStep === "FORM" && (
                <form onSubmit={handleChangePasswordSendOtp} className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      required
                      type={cpShowCurrent ? "text" : "password"}
                      placeholder="Current Password"
                      value={cpForm.currentPassword}
                      onChange={(e) => setCpForm({ ...cpForm, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      disabled={cpLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowCurrent(!cpShowCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {cpShowCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      required
                      type={cpShowNew ? "text" : "password"}
                      placeholder="New Password (min 6 characters)"
                      value={cpForm.newPassword}
                      onChange={(e) => setCpForm({ ...cpForm, newPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      disabled={cpLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setCpShowNew(!cpShowNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {cpShowNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      required
                      type="password"
                      placeholder="Confirm New Password"
                      value={cpForm.confirmPassword}
                      onChange={(e) => setCpForm({ ...cpForm, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      disabled={cpLoading}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetChangePassword}
                      disabled={cpLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={cpLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Mail size={14} />
                      {cpLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </form>
              )}

              {cpStep === "OTP" && (
                <form onSubmit={handleChangePasswordVerify} className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={cpOtp}
                      onChange={(value) => setCpOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500">OTP expires in 5 minutes</p>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setCpStep("FORM"); setCpOtp(""); setCpError(""); }}
                      disabled={cpLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={cpLoading || cpOtp.length !== 6}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Check size={14} />
                      {cpLoading ? "Verifying..." : "Verify & Change"}
                    </button>
                  </div>
                </form>
              )}

              {cpStep === "SUCCESS" && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <Check size={28} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-4">Your password has been changed successfully.</p>
                  <button
                    onClick={resetChangePassword}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-red-200 dark:border-red-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                    {t("settings.deleteAccount")}
                  </h3>
                  <p className="text-xs text-red-500/70 dark:text-red-400/60">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will permanently delete your account, all documents, uploaded files, and data. 
                Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm.
              </p>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 text-sm text-gray-800 dark:text-gray-200 placeholder-red-300 dark:placeholder-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
                disabled={deleteLoading}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleteLoading(true);
                    const result = await deleteAccount();
                    if (!result.success) {
                      toast.error(result.error || "Failed to delete account", {
                        position: "top-right",
                        autoClose: 3000,
                        icon: "❌",
                      });
                      setDeleteLoading(false);
                    }
                  }}
                  disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2
                    ${deleteConfirmText === "DELETE" && !deleteLoading
                      ? "bg-red-600 hover:bg-red-700 shadow-md"
                      : "bg-red-300 dark:bg-red-800 cursor-not-allowed opacity-60"
                    }`}
                >
                  <Trash2 size={14} />
                  {deleteLoading ? "Deleting..." : "Delete Forever"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer spacer */}
        <div className="h-10" />
      </div>
    </div>
  );
}
