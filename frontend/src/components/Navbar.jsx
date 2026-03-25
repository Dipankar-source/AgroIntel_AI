import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Menu,
  X,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import PlanBadgeButton from "./ui/subscription-navbar-button";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { searchRoutes } from "../search/routes";

const NAV_LINKS = [
  { label: "Dashboard", i18nKey: "nav.dashboard", href: "/" },
  { label: "Soil Analysis", i18nKey: "nav.soilAnalysis", href: "/soil" },
  { label: "Crop Planner", i18nKey: "nav.cropPlanner", href: "/planner" },
  { label: "Market", i18nKey: "nav.market", href: "/market" },
];

// Profile dropdown items
const PROFILE_ITEMS = [
  { label: "Your Profile", i18nKey: "nav.yourProfile", icon: User, href: "/profile" },
  { label: "Settings", i18nKey: "nav.settings", icon: Settings, href: "/settings" },
  { label: "Help", i18nKey: "nav.help", icon: HelpCircle, href: "/help" },
  { label: "Logout", i18nKey: "common.logout", icon: LogOut, href: "/logout", danger: true },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
  const [notificationHovered, setNotificationHovered] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { user, logout, isAuthenticated } = useUser();
  const { theme, setTheme } = useTheme();
  const { t, n } = useLanguage();

  const isDark = theme === "dark";
  const toggleThemeMode = () => setTheme(isDark ? "light" : "dark");
  const ThemeIcon = isDark ? Sun : Moon;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [notifications, setNotifications] = useState([]);
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  
  // Farmer Points State
  const [farmerPoints, setFarmerPoints] = useState({
    totalPoints: 0,
    weeklyPoints: 0
  });
  const [pointsLoading, setPointsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  const displayName = user?.fullName || user?.name || "User";
  const displayEmail = user?.email || "";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";
  let planKey = user?.activePlan?.planName || 'Free';
  

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when search is open
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [searchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }

      // Escape to close search
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
        setShowSuggestions(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Handle hover with delay for better UX
  const handleSearchMouseEnter = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearchHovered(true);
  };

  const handleSearchMouseLeave = () => {
    searchTimeoutRef.current = setTimeout(() => {
      setSearchHovered(false);
    }, 100);
  };

  const handleSearchClick = () => {
    setSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const results = searchRoutes(searchQuery);
    if (results.length > 0) {
      navigate(results[0].href);
      closeSearch();
    }
  };

  const handleSuggestionClick = (route) => {
    navigate(route.href);
    closeSearch();
  };

  const handleNotificationMouseEnter = () => {
    if (notificationTimeoutRef.current)
      clearTimeout(notificationTimeoutRef.current);
    setNotificationHovered(true);
  };

  const handleNotificationMouseLeave = () => {
    notificationTimeoutRef.current = setTimeout(() => {
      setNotificationHovered(false);
    }, 100);
  };

  const handleProfileMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setProfileDropdownOpen(true);
    fetchFarmerPoints();
  };

  const handleProfileMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 150);
  };

  const isActiveRoute = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const filteredRoutes = searchRoutes(searchQuery);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setNotificationsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/notifications?limit=20`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setNotificationsUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("FETCH_NOTIFICATIONS_ERROR:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.patch(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        { withCredentials: true },
      );

      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id
              ? {
                  ...n,
                  readAt:
                    res.data.notification?.readAt || new Date().toISOString(),
                }
              : n,
          ),
        );
        setNotificationsUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("MARK_NOTIFICATION_READ_ERROR:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        { withCredentials: true },
      );
      if (res.data?.success) {
        const nowIso = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => (n.readAt ? n : { ...n, readAt: nowIso })),
        );
        setNotificationsUnreadCount(0);
      }
    } catch (err) {
      console.error("MARK_ALL_NOTIFICATIONS_READ_ERROR:", err);
    }
  };

  // Fetch farmer points from API
  const fetchFarmerPoints = async () => {
    if (!isAuthenticated) return;
    setPointsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/user/farmer-points`, {
        withCredentials: true,
      });
      if (res.data?.success && res.data.points) {
        setFarmerPoints({
          totalPoints: res.data.points.totalPoints || 0,
          weeklyPoints: res.data.points.weeklyPoints || 0,
        });
      }
    } catch (err) {
      console.error("FETCH_FARMER_POINTS_ERROR:", err);
    } finally {
      setPointsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationsUnreadCount(0);
      return;
    }

    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Full-screen search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center pt-[20vh] "
            onClick={() => {
              closeSearch();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search form */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t("nav.searchPlaceholder")}
                  className="w-full h-14 pl-14 pr-14 text-lg bg-white rounded-2xl 
                           border-2 border-transparent focus:border-green-500 
                           focus:outline-none shadow-2xl"
                />

                <Search
                  size={20}
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    closeSearch();
                  }}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 
                           text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </form>

              {/* Search suggestions */}
              <AnimatePresence>
                {showSuggestions && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="mt-2 bg-white rounded-xl shadow-2xl overflow-hidden"
                  >
                    {filteredRoutes.length > 0 ? (
                      <div className="py-2">
                        {filteredRoutes.map((route, index) => (
                          <motion.button
                            key={route.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleSuggestionClick(route)}
                            className="w-full px-6 py-3 text-left flex items-center gap-3
                                     hover:bg-green-50 transition-colors group"
                          >
                            <Search size={16} className="text-gray-400" />
                            <span className="flex-1 text-gray-700">
                              {route.label}
                            </span>
                            <ArrowRight
                              size={16}
                              className="text-gray-400 opacity-0 group-hover:opacity-100 
                                       transform translate-x-[-10px] group-hover:translate-x-0 
                                       transition-all"
                            />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No suggestions found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick tips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-center text-sm text-white/80"
              >
                Press <kbd className="px-2 py-1 bg-white/20 rounded-md">↵</kbd>{" "}
                to search,{" "}
                <kbd className="px-2 py-1 bg-white/20 rounded-md">esc</kbd> to
                close
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        animate={{
          boxShadow: scrolled
            ? "0 2px 24px rgba(16,185,129,0.10)"
            : "0 0px 0px transparent",
          backgroundColor: scrolled
            ? "var(--nav-scrolled-bg)"
            : "var(--nav-transparent-bg)",
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md max-w-5xl mx-auto rounded-md"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-shadow"
              >
                <img src="./logo-brows.png" alt="logo" className="w-8 h-8" />
              </motion.div>
              <span className="font-cormorant text-[1.25rem] font-extrabold text-gray-800 leading-none">
                AgroIntel
              </span>
            </button>

            {/* Desktop nav with active state */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => {
                const isActive = isActiveRoute(l.href);
                return (
                  <motion.button
                    key={l.label}
                    onClick={() => navigate(l.href)}
                    className="relative font-dm text-[13px] font-medium px-4 py-2 rounded-xl cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive
                          ? "text-green-700"
                          : "text-gray-500 group-hover:text-green-700"
                      }`}
                    >
                      {t(l.i18nKey)}
                    </span>

                    {/* Active state indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-green-50 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Hover effect background */}
                    <motion.div
                      className="absolute inset-0 bg-green-50 rounded-xl opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.15 }}
                    />
                  </motion.button>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {planKey && (
                <PlanBadgeButton
                  userPlan={planKey}
                  onClick={() => navigate("/subscription")}
                />
              )}
              {/* Theme toggle */}
              <motion.button
                onClick={toggleThemeMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="w-8 h-8 flex items-center justify-center rounded-xl
                         text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
                         transition-colors"
              >
                <ThemeIcon size={16} />
              </motion.button>

              {/* Search button */}
              <div
                className="relative"
                onMouseEnter={handleSearchMouseEnter}
                onMouseLeave={handleSearchMouseLeave}
              >
                <motion.button
                  className="w-8 h-8 flex items-center justify-center rounded-xl
                           text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearchClick}
                >
                  <Search size={16} />
                </motion.button>

                <AnimatePresence>
                  {searchHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, x: "-50%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1
                               bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-50
                               shadow-lg"
                    >
                      Search{" "}
                      <span className="bg-gray-700 px-1 rounded ml-1">⌘K</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notification with tooltip */}
              <div
                className="relative"
                onMouseEnter={() => {
                  handleNotificationMouseEnter();
                  fetchNotifications();
                }}
                onMouseLeave={handleNotificationMouseLeave}
              >
                <motion.button
                  className="relative w-8 h-8 flex items-center justify-center rounded-xl
                           text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const next = !notificationHovered;
                    setNotificationHovered(next);
                    if (next) fetchNotifications();
                  }}
                >
                  <Bell size={16} />
                  {isAuthenticated && notificationsUnreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 1 }}
                      animate={{ scale: notificationHovered ? 1.2 : 1 }}
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full"
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {notificationHovered &&
                    (isAuthenticated ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-xl shadow-lg
                               border border-gray-100 overflow-hidden z-50 sm:w-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">
                            {t("nav.notifications")}
                          </p>
                          {notificationsUnreadCount > 0 ? (
                            <button
                              type="button"
                              onClick={markAllNotificationsRead}
                              className="text-xs text-green-700 hover:text-green-800"
                            >
                              {t("nav.markAllRead")}
                            </button>
                          ) : null}
                        </div>

                        <div className="max-h-80 overflow-auto">
                          {notificationsLoading ? (
                            <div className="px-4 py-6 text-sm text-gray-500">
                              Loading...
                            </div>
                          ) : notifications.length > 0 ? (
                            <div className="py-1">
                              {notifications.map((n) => {
                                const isUnread = !n.readAt;
                                return (
                                  <button
                                    key={n._id}
                                    type="button"
                                    onClick={() => markNotificationRead(n._id)}
                                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors duration-150
                                      ${isUnread ? "bg-green-50/50 hover:bg-green-50" : "hover:bg-gray-50"}`}
                                  >
                                    <span
                                      className={`mt-1 w-2 h-2 rounded-full flex-none ${
                                        isUnread
                                          ? "bg-green-500"
                                          : "bg-gray-200"
                                      }`}
                                    />
                                    <span className="min-w-0">
                                      <span className="block text-sm font-medium text-gray-700 truncate">
                                        {n.title}
                                      </span>
                                      <span className="block text-xs text-gray-500 line-clamp-2">
                                        {n.message}
                                      </span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-sm text-gray-500">
                              {t("nav.noNotifications")}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 5, x: "-50%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1
                               bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-50"
                      >
                        Notifications
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Avatar with dropdown */}
              {user && (
                <div
                  ref={profileRef}
                  className="relative"
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-xl 
                           flex items-center justify-center cursor-pointer
                           shadow-[0_2px_8px_rgba(22,163,74,0.25)] hover:shadow-[0_4px_12px_rgba(22,163,74,0.35)]
                           transition-shadow"
                  >
                    <img
                      src={user.profilePicture?.url || "/default-avatar.svg"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </motion.div>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg
                               border border-gray-100 overflow-hidden z-50"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {displayName}
                            </p>
                            {displayEmail ? (
                              <p className="text-xs text-gray-500">
                                {displayEmail}
                              </p>
                            ) : null}
                          </div>
                          <div>
                            🪙<span className="text-sm font-light">{pointsLoading ? '...' : n(farmerPoints.totalPoints)}</span>
                            <p className="text-[12px]">
                              This Week Added{" "}
                              <span className="text-sm font-medium text-yellow-700">
                                {pointsLoading ? '...' : n(farmerPoints.weeklyPoints)} points
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Dropdown items */}
                        <div className="py-1">
                          {PROFILE_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <motion.button
                                key={item.label}
                                whileHover={{ x: 4 }}
                                onClick={async () => {
                                  if (item.label === "Logout") {
                                    await logout();
                                    setProfileDropdownOpen(false);
                                  } else {
                                    navigate(item.href);
                                    setProfileDropdownOpen(false);
                                  }
                                }}
                                className={`w-full px-4 py-2.5 text-sm flex items-center gap-3
                                       transition-colors duration-150
                                       ${
                                         item.danger
                                           ? "text-red-600 hover:bg-red-50"
                                           : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                                       }`}
                              >
                                <Icon size={16} />
                                <span>{t(item.i18nKey)}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {!user && (
                <div className=" items-center justify-center gap-5 hidden md:flex">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate("/login")}
                    className="px-4.5 py-2 rounded-sm bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {t("common.login")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 rounded-sm shadow drop-shadow-green-700 text-green-600 text-sm font-medium cursor-pointer"
                  >
                    {t("common.signUp")}
                  </motion.button>
                </div>
              )}

              {/* Mobile menu toggle - only when not logged in (for Login/SignUp) */}
              {!user && (
                <motion.button
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl
                             text-gray-500 hover:bg-gray-100 transition-colors"
                  onClick={() => setMenuOpen((v) => !v)}
                  whileTap={{ scale: 0.95 }}
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu - Login/SignUp only (nav is in bottom bar) */}
        <AnimatePresence>
          {menuOpen && !user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden bg-white/98 border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-wrap items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                  className="px-4.5 py-2 rounded-sm bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                >
                  {t("common.login")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    navigate("/signup");
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-sm shadow drop-shadow-green-700 text-green-600 text-sm font-medium cursor-pointer"
                >
                  {t("common.signUp")}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navbar;
