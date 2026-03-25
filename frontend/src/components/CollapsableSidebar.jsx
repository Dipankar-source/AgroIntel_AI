import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  LayoutDashboard,
  FlaskConical,
  CalendarDays,
  TrendingUp,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const LINKS = [
  { icon: LayoutDashboard, i18nKey: "nav.dashboard", label: "Dashboard", href: "/" },
  { icon: FlaskConical, i18nKey: "nav.soilAnalysis", label: "Soil Analysis", href: "/soil" },
  { icon: CalendarDays, i18nKey: "nav.cropPlanner", label: "Crop Planner", href: "/planner" },
  { icon: TrendingUp, i18nKey: "nav.marketTrends", label: "Market Trends", href: "/market" },
  { icon: Settings, i18nKey: "nav.settings", label: "Settings", href: "/settings" },
];

const CollapsableSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <>
      <style>{`
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      {/* Only visible on lg+ */}
      <motion.aside
        animate={{ width: expanded ? 200 : 64 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex fixed left-0 top-0 h-full z-40 flex-col
                   bg-white border-r border-gray-100
                   shadow-[2px_0_20px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 shrink-0">
          <div
            className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-green-500 to-emerald-600
                          flex items-center justify-center shrink-0
                          shadow-[0_2px_10px_rgba(22,163,74,0.3)]"
          >
            <Sprout size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-cormorant text-[1.1rem] font-bold text-gray-800 ml-2.5 whitespace-nowrap"
              >
                AgroIntel
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="absolute -right-3 top-[4.2rem] w-6 h-6 rounded-full
                     bg-white border border-gray-200 shadow-sm
                     flex items-center justify-center
                     hover:border-green-300 hover:text-green-600 transition-colors z-10"
        >
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronRight size={12} className="text-gray-400" />
          </motion.div>
        </button>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-hidden">
          {LINKS.map(({ icon: Icon, label, i18nKey, href }) => {
            const active = location.pathname === href;
            return (
              <button
                key={label}
                onClick={() => navigate(href)}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl
                            transition-all duration-150 cursor-pointer text-left
                            ${
                              active
                                ? "bg-green-50 text-green-700"
                                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                            }`}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className="font-dm text-[13px] font-medium whitespace-nowrap"
                    >
                      {t(i18nKey)}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-green-500 rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-6 border-t border-gray-100 pt-3">
          <button
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl
                       text-gray-400 hover:bg-red-50 hover:text-red-500
                       transition-all duration-150 cursor-pointer"
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="font-dm text-[13px] font-medium whitespace-nowrap"
                >
                  {t("common.logout")}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default CollapsableSidebar;
