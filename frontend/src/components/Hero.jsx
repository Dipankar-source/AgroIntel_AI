import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Leaf, Zap, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { useState, useEffect } from "react";


const getTimeGreetingKey = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "hero.greetingMorning";
  if (h >= 12 && h < 17) return "hero.greetingAfternoon";
  return "hero.greetingEvening";
};

const Hero = (props) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { t, n } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [farmerPoints, setFarmerPoints] = useState(null);
  const [pointsLoading, setPointsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (isAuthenticated) {
      fetchFarmerPoints();
    }
  }, [isAuthenticated]);

  const fetchFarmerPoints = async () => {
    setPointsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/user/farmer-points`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setFarmerPoints({
          totalPoints: res.data.points?.totalPoints || 0,
          weeklyPoints: res.data.points?.weeklyPoints || 0
        });
      }
    } catch (err) {
      console.error("FETCH_FARMER_POINTS_ERROR:", err);
    } finally {
      setPointsLoading(false);
    }
  };

  const propIsLoggedIn = props?.isLoggedIn;
  const propUserName = props?.userName;

  const effectiveIsLoggedIn =
    typeof propIsLoggedIn === "boolean" ? propIsLoggedIn : isAuthenticated;

  const derivedName =
    user?.fullName?.trim()?.split(" ")?.[0] ||
    user?.name?.trim()?.split(" ")?.[0] ||
    "Farmer";

  const effectiveUserName = propUserName || derivedName;

  return (
    <>
      <style>{`
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[24px] overflow-hidden bg-white dark:bg-gray-800/90
                     border border-gray-100 dark:border-white/10 shadow-[0_8px_40px_rgba(16,185,129,0.08)]
                     dark:shadow-[0_8px_40px_rgba(0,0,0,0.2)]
                     p-6 sm:p-8 lg:p-10"
        >
          {/* Background accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-bl-[60%] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-50/50 to-transparent dark:from-green-900/10 dark:to-transparent rounded-tr-[60%] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-lg">
              {/* Conditional Badge */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/40 mb-4"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    effectiveIsLoggedIn
                      ? "bg-green-500 animate-pulse"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="font-dm text-[11px] text-green-700 dark:text-green-300 font-medium uppercase tracking-widest">
                  {effectiveIsLoggedIn
                    ? t("hero.badgeLoggedIn")
                    : t("hero.badgeLoggedOut")}
                </span>
              </motion.div>

              {/* Conditional Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.55 }}
                className="font-cormorant text-[2.4rem] sm:text-[3rem] lg:text-[3.4rem]
                           font-bold text-gray-800 dark:text-white leading-[1.05] tracking-tight mb-3"
              >
                {effectiveIsLoggedIn ? (
                  <>
                    {t(getTimeGreetingKey())}<br />
                    <span className="text-green-600 dark:text-green-400">{effectiveUserName}.</span>
                  </>
                ) : (
                  <>
                    {t("hero.headingLine1")} <br />
                    <span className="text-green-600 dark:text-green-400">{t("hero.headingLine2")}</span>
                  </>
                )}
              </motion.h1>

              {/* Conditional Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.5 }}
                className="font-dm font-light text-gray-500 dark:text-gray-300 text-[14px] leading-relaxed mb-6 max-w-sm"
              >
                {effectiveIsLoggedIn
                  ? t("hero.descLoggedIn")
                  : t("hero.descLoggedOut")}
              </motion.p>

              {/* Conditional Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33, duration: 0.45 }}
                className="flex flex-wrap gap-3"
              >
                {effectiveIsLoggedIn ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/ai-insights")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-[13px] bg-gradient-to-r from-green-600 to-emerald-500 text-white font-dm font-medium text-[13.5px] shadow-[0_4px_16px_rgba(22,163,74,0.28)] cursor-pointer border-none"
                    >
                      {t("hero.viewInsights")} <ArrowRight size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/planner")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-[13px] border border-gray-200 dark:border-white/15 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 font-dm font-medium text-[13.5px] hover:border-green-200 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 dark:hover:text-green-300 dark:hover:border-green-700 transition-all cursor-pointer"
                    >
                      {t("hero.planSeason")}
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/signup")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-[13px] bg-green-600 text-white font-dm font-medium text-[13.5px] cursor-pointer border-none shadow-lg"
                    >
                      {t("hero.getStarted")} <ArrowRight size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/demo")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-[13px] border border-gray-200 dark:border-white/15 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 font-dm font-medium text-[13.5px] hover:bg-gray-50 dark:hover:bg-gray-600 transition-all cursor-pointer"
                    >
                      {t("hero.watchDemo")}
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Right Visual - Changes based on state */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.55 }}
              className="flex-shrink-0 hidden sm:flex flex-col items-center justify-center
                         w-44 h-44 lg:w-52 lg:h-52 rounded-full
                         bg-gradient-to-br from-green-50 to-emerald-50
                         dark:from-green-900/30 dark:to-emerald-900/20
                         border-[6px] border-white dark:border-gray-700
                         shadow-[0_8px_32px_rgba(16,185,129,0.15)]
                         dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]
                         relative"
            >
              <div className="absolute inset-3 rounded-full border-2 border-dashed border-green-200/60 dark:border-green-600/30" />
              {effectiveIsLoggedIn ? (
                <>
                  {pointsLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full" />
                      <p className="font-dm text-[11px] text-green-600/70 dark:text-green-400/80 uppercase tracking-widest">
                        Loading...
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="font-cormorant text-[2.6rem] font-bold text-green-700 dark:text-green-300 leading-none">
                        {n(farmerPoints?.totalPoints?.toFixed(0) || '0')}
                      </p>
                      <p className="font-dm text-[11px] text-green-600/70 dark:text-green-400/80 uppercase tracking-widest mt-1">
                        {t("hero.farmerPoints")}
                      </p>
                      <p className="font-dm text-[10px] text-gray-400 dark:text-gray-300 mt-0.5 font-light">
                        ↑ {n(farmerPoints?.weeklyPoints?.toFixed(1) || '0')} {t("hero.ptsThisWeek")}
                      </p>
                    </>
                  )}
                </>
              ) : (
                <>
                  <ShieldCheck size={40} className="text-green-600 dark:text-green-400 mb-2" />
                  <p className="font-dm text-[11px] text-green-700 dark:text-green-300 font-bold uppercase tracking-wider">
                    {t("hero.trustedBy")}
                  </p>
                  <p className="font-dm text-[14px] text-gray-600 dark:text-gray-300 font-medium leading-none">
                    {t("hero.farms")}
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
