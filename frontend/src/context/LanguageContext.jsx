import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

// Import translation files
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import bn from "../i18n/bn.json";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const translations = { en, hi, bn };

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
];

/**
 * Digit maps for non‑Latin numeral scripts.
 * Bengali: ০১২৩৪৫৬৭৮৯   Hindi/Devanagari: ०१२३४५६७८९
 */
const DIGIT_MAP = {
  bn: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
  hi: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
};

/**
 * Convert Latin digits (0‑9) in a value to the current language's script.
 * Accepts numbers or strings. Non‑digit characters (₹ % ° . , − /) are preserved.
 */
const localizeDigits = (value, lang) => {
  if (lang === "en" || !DIGIT_MAP[lang]) return String(value);
  return String(value).replace(/[0-9]/g, (d) => DIGIT_MAP[lang][+d]);
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

/**
 * Get a nested value from an object using dot‑notation key.
 * e.g. resolve(obj, "nav.dashboard") => obj.nav.dashboard
 */
const resolve = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

/**
 * Detect the best default language from the browser.
 * Returns one of our supported codes or "en" as fallback.
 */
const detectBrowserLanguage = () => {
  const browserLang = (navigator.language || navigator.languages?.[0] || "en").toLowerCase();
  if (browserLang.startsWith("bn")) return "bn";
  if (browserLang.startsWith("hi")) return "hi";
  return "en";
};

export const LanguageProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();

  // Determine initial language: user preference > localStorage > browser
  const getInitialLanguage = () => {
    if (user?.language && translations[user.language]) {
      return user.language;
    }
    const stored = localStorage.getItem("preferredLanguage");
    if (stored && translations[stored]) {
      return stored;
    }
    return detectBrowserLanguage();
  };

  const [language, setLanguageState] = useState(getInitialLanguage);

  // Sync language from user profile when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.language && translations[user.language]) {
      setLanguageState(user.language);
      localStorage.setItem("preferredLanguage", user.language);
    }
  }, [isAuthenticated, user?.language]);

  /**
   * Change language. Persists to localStorage always,
   * and to backend when authenticated.
   */
  const setLanguage = useCallback(
    async (langCode) => {
      if (!translations[langCode]) return;

      setLanguageState(langCode);
      localStorage.setItem("preferredLanguage", langCode);

      // Persist to backend if logged in
      if (isAuthenticated) {
        try {
          await axios.put(
            `${API_URL}/api/user/currentuser`,
            { language: langCode },
            { withCredentials: true, headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          console.error("Failed to persist language preference:", err);
        }
      }
    },
    [isAuthenticated]
  );

  /**
   * Translation function.
   * Usage: t("nav.dashboard") => "Dashboard" (en) or "ড্যাশবোর্ড" (bn)
   *
   * Supports interpolation: t("subscription.currentPlan", { plan: "Pro" })
   * Template uses {key} syntax: "You're on the {plan} plan"
   *
   * Numbers in interpolated params are auto‑localised to the current
   * language's script (Bengali / Devanagari digits).
   */
  const t = useCallback(
    (key, params) => {
      let value = resolve(translations[language], key);

      // Fallback to English if key missing in current language
      if (value === undefined || value === null) {
        value = resolve(translations.en, key);
      }

      // If still missing, return the key itself
      if (value === undefined || value === null) {
        return key;
      }

      // Interpolate params: replace {param} with actual values
      // and auto‑localise digits in the substituted value.
      if (params && typeof value === "string") {
        Object.entries(params).forEach(([k, v]) => {
          const localisedV = localizeDigits(v, language);
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), localisedV);
        });
      }

      return value;
    },
    [language]
  );

  /**
   * Number‑localisation helper.
   * Converts Latin digits in any value to the current language's script.
   *
   * Usage: n(2520)     => "২৫২০" (bn) / "२५२०" (hi) / "2520" (en)
   *        n("6.4 pH") => "৬.৪ pH" (bn)
   */
  const n = useCallback(
    (value) => localizeDigits(value, language),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      n,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, n]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
