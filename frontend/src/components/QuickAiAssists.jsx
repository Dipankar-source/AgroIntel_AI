import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Send,
  X,
  Sparkles,
  Languages,
  Mail,
  FileText,
  Zap,
  MessageSquare,
  Volume2,
  VolumeX,
  BookOpen,
  Compass,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

/* ═══════════════════════════════════════════════════════════════
   TTS (Text-to-Speech) helpers — language-aware
   ═══════════════════════════════════════════════════════════════ */
const TTS_LANG_MAP = {
  en: "en-US",
  hi: "hi-IN",
  bn: "bn-IN",
};

/** Pick the best voice for a BCP-47 lang tag */
const pickVoice = (langTag) => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === langTag) ||
    voices.find((v) => v.lang.startsWith(langTag.split("-")[0])) ||
    voices[0]
  );
};

/** Speak text in the given language. Returns the utterance so caller can cancel. */
const speakText = (text, language, onEnd) => {
  if (!window.speechSynthesis) return null;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const langTag = TTS_LANG_MAP[language] || "en-US";
  utterance.lang = langTag;
  const voice = pickVoice(langTag);
  if (voice) utterance.voice = voice;
  utterance.rate = language === "en" ? 1 : 0.92;
  utterance.pitch = 1;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
  return utterance;
};

/* ═══════════════════════════════════════════════════════════════
   Full application knowledge base — multilingual
   ═══════════════════════════════════════════════════════════════ */
const APP_KNOWLEDGE = {
  en: {
    appName: "AgroIntel",
    overview:
      "AgroIntel is an AI-powered precision farming platform. It provides soil analysis, crop planning, market intelligence, real-time weather data, connected device monitoring, and farmer reward points — all accessible from a single dashboard.",
    pages: {
      dashboard: {
        path: "/",
        name: "Dashboard (Home)",
        description:
          "The main landing page. Shows a hero section with your Farmer Points, AI insights badge, connected devices status, market insights widget, weather overview, and an about section. Guests can preview most sections but need to sign in for live data.",
        howToAccess: "Open the app — it loads automatically, or click 'Dashboard' in the navigation bar.",
      },
      soilAnalysis: {
        path: "/soil",
        name: "Soil Analysis",
        description:
          "Upload soil lab reports or manually enter soil parameters (pH, Nitrogen, Phosphorus, Potassium, Organic Matter, Moisture, Soil Type). The AI generates NPK recommendations, pH correction plans, and yield forecasts in seconds.",
        howToAccess: "Click 'Soil Analysis' or 'Soil' in the navigation bar. Requires login.",
      },
      cropPlanner: {
        path: "/planner",
        name: "Crop Planner",
        description:
          "Season-aware, climate-calibrated planting calendars. Includes weather forecasts, growth timelines, yield projections, and task management for your farm plots.",
        howToAccess: "Click 'Crop Planner' or 'Planner' in the navigation bar. Requires login.",
      },
      market: {
        path: "/market",
        name: "Market Insights",
        description:
          "Track commodity prices, demand trends, regional mandi prices, 7-day price forecasts, and profit opportunities. Best prices, active buyers, nearby mandis, and weather impact on markets are all displayed.",
        howToAccess: "Click 'Market' in the navigation bar. Requires login. Guests see a preview.",
      },
      aiInsights: {
        path: "/ai-insights",
        name: "AI Insights",
        description:
          "AI-generated insights specific to your farm — moisture alerts, pest predictions, optimal harvest windows, and actionable recommendations.",
        howToAccess: "Click 'AI Insights' in the navigation, or the 'View Insights' button on the hero section. Requires login.",
      },
      profile: {
        path: "/profile",
        name: "Profile",
        description:
          "View and edit your personal information: name, email, phone, date of birth, gender, farmer type, language preference, and profile photo. Tabs include Overview, Crops, Land & Equipment, Finance, Schemes, AI Insights, and Documents.",
        howToAccess: "Click your avatar or name in the navigation bar, then select 'Profile'. Requires login.",
      },
      settings: {
        path: "/settings",
        name: "Settings",
        description:
          "Manage language preference (English, Hindi, Bengali), appearance (Light/Dark theme), notification preferences (Push, Email, Weather, Market alerts), privacy & data sharing, and account management (change password, export data, view subscription, delete account).",
        howToAccess: "Click the gear icon or 'Settings' in the navigation bar. Requires login.",
      },
      subscription: {
        path: "/subscription",
        name: "Subscription",
        description:
          "Choose from Free, Monthly, or Annual plans. Upgrade or downgrade anytime. Annual billing saves up to 20%. All transactions are 256-bit encrypted and GDPR compliant.",
        howToAccess: "Go to Settings → View Subscription, or navigate directly to Subscription. Requires login.",
      },
      billing: {
        path: "/billing",
        name: "Billing",
        description:
          "Secure checkout with multiple payment methods: Credit/Debit Card, UPI, Net Banking. Supports saved cards, GST invoices, and Razorpay-secured transactions.",
        howToAccess: "Select a plan on the Subscription page, then proceed to Billing. Requires login.",
      },
      demo: {
        path: "/demo",
        name: "Watch Demo",
        description:
          "A video walkthrough of all AgroIntel features. No login required. Great for understanding what the platform offers before signing up.",
        howToAccess: "Click 'Watch Demo' button from the home page hero section, or navigate to /demo.",
      },
      login: {
        path: "/login",
        name: "Login",
        description: "Sign in with your email and password to access all farm data, AI insights, and premium features.",
        howToAccess: "Click 'Login' or 'Sign In' from the navigation bar.",
      },
      signup: {
        path: "/signup",
        name: "Sign Up",
        description: "Create a new AgroIntel account with your name, email, and password. Start accessing soil analysis, crop planner, and market data.",
        howToAccess: "Click 'Sign Up' or 'Get Started' from the home page.",
      },
    },
    features: {
      weather:
        "Real-time weather data with 5-day forecasts, soil temperature, humidity, wind speed, pressure, cloud cover, and agricultural weather insights. Supports metric (°C) and imperial (°F). Search by city or zip code.",
      devices:
        "Connected Devices section monitors IoT sensors: Soil Sensor (moisture, pH, NPK), Temperature Monitor (air/soil temp, dew point), Weather Station (wind, humidity, pressure), and Light Sensor (PAR, Lux, UV). Shows battery level, signal strength, and last sync time.",
      farmerPoints:
        "Earn Farmer Points by using the app — checking soil data, planning crops, viewing market trends. Points are shown on the hero dashboard. Weekly points track your recent activity.",
      language:
        "AgroIntel supports 3 languages: English, Hindi (हिन्दी), and Bengali (বাংলা). Change language from Settings → Language Preference. The entire app switches instantly, including numbers in native scripts.",
      darkMode:
        "Switch between Light and Dark themes from Settings → Appearance. The theme applies across all pages instantly.",
      notifications:
        "Configure Push Notifications, Email Digest (weekly farm summary), Weather Alerts (severe weather), and Market Price Alerts from Settings → Notifications.",
      security:
        "256-bit SSL encryption, Razorpay-secured payments, GDPR compliant, end-to-end encrypted farm data. AgroIntel never trains on your data or sells it to third parties.",
    },
    navigation:
      "Use the top navigation bar on desktop or the bottom navigation bar on mobile. Pages: Dashboard, Soil Analysis, Crop Planner, Market, AI Insights, Profile, Settings. Use the search bar to quickly find any page.",
    guestVsLoggedIn:
      "Guests can view the home page preview (hero, about, devices preview, market preview). To access Soil Analysis, Crop Planner, Market data, AI Insights, Profile, Settings, Subscription, and Billing, you must sign in.",
  },

  hi: {
    appName: "AgroIntel",
    overview:
      "AgroIntel एक AI-संचालित सटीक खेती प्लेटफ़ॉर्म है। यह मिट्टी विश्लेषण, फसल योजना, बाज़ार बुद्धिमत्ता, रियल-टाइम मौसम डेटा, कनेक्टेड डिवाइस मॉनिटरिंग, और किसान रिवॉर्ड पॉइंट्स प्रदान करता है — सब कुछ एक ही डैशबोर्ड से।",
    pages: {
      dashboard: {
        path: "/",
        name: "डैशबोर्ड (होम)",
        description:
          "मुख्य लैंडिंग पेज। हीरो सेक्शन में किसान पॉइंट्स, AI इनसाइट्स बैज, कनेक्टेड डिवाइस स्टेटस, बाज़ार इनसाइट्स विजेट, मौसम ओवरव्यू और अबाउट सेक्शन दिखाता है।",
        howToAccess: "ऐप खोलें — यह स्वचालित रूप से लोड होता है, या नेविगेशन बार में 'डैशबोर्ड' पर क्लिक करें।",
      },
      soilAnalysis: {
        path: "/soil",
        name: "मिट्टी विश्लेषण",
        description:
          "मिट्टी की लैब रिपोर्ट अपलोड करें या मैन्युअल रूप से मिट्टी के पैरामीटर दर्ज करें (pH, नाइट्रोजन, फॉस्फोरस, पोटैशियम, ऑर्गेनिक मैटर, नमी, मिट्टी का प्रकार)। AI सेकंडों में NPK सिफारिशें, pH सुधार योजनाएं और उपज पूर्वानुमान तैयार करता है।",
        howToAccess: "नेविगेशन बार में 'मिट्टी विश्लेषण' या 'मिट्टी' पर क्लिक करें। लॉगिन आवश्यक है।",
      },
      cropPlanner: {
        path: "/planner",
        name: "फसल योजनाकार",
        description:
          "सीज़न-जागरूक, जलवायु-कैलिब्रेटेड बुवाई कैलेंडर। मौसम पूर्वानुमान, विकास टाइमलाइन, उपज अनुमान और कार्य प्रबंधन शामिल है।",
        howToAccess: "नेविगेशन बार में 'फसल योजनाकार' या 'योजनाकार' पर क्लिक करें। लॉगिन आवश्यक है।",
      },
      market: {
        path: "/market",
        name: "बाज़ार इनसाइट्स",
        description:
          "कमोडिटी कीमतों, माँग रुझानों, क्षेत्रीय मंडी कीमतों, 7-दिवसीय मूल्य पूर्वानुमान और लाभ के अवसरों को ट्रैक करें।",
        howToAccess: "नेविगेशन बार में 'बाज़ार' पर क्लिक करें। लॉगिन आवश्यक है।",
      },
      aiInsights: {
        path: "/ai-insights",
        name: "AI इनसाइट्स",
        description: "आपके खेत के लिए AI-जनित इनसाइट्स — नमी अलर्ट, कीट भविष्यवाणी, इष्टतम कटाई विंडो, और कार्रवाई योग्य सिफारिशें।",
        howToAccess: "नेविगेशन में 'AI इनसाइट्स' पर क्लिक करें, या हीरो सेक्शन पर 'इनसाइट्स देखें' बटन। लॉगिन आवश्यक है।",
      },
      profile: {
        path: "/profile",
        name: "प्रोफ़ाइल",
        description: "अपनी व्यक्तिगत जानकारी देखें और संपादित करें: नाम, ईमेल, फ़ोन, जन्म तिथि, लिंग, किसान प्रकार, भाषा प्राथमिकता, और प्रोफ़ाइल फ़ोटो।",
        howToAccess: "नेविगेशन बार में अपने अवतार या नाम पर क्लिक करें, फिर 'प्रोफ़ाइल' चुनें। लॉगिन आवश्यक है।",
      },
      settings: {
        path: "/settings",
        name: "सेटिंग्स",
        description: "भाषा प्राथमिकता (English, Hindi, Bengali), थीम (लाइट/डार्क), नोटिफिकेशन (पुश, ईमेल, मौसम, बाज़ार अलर्ट), गोपनीयता और अकाउंट प्रबंधन करें।",
        howToAccess: "नेविगेशन बार में गियर आइकन या 'सेटिंग्स' पर क्लिक करें। लॉगिन आवश्यक है।",
      },
      subscription: {
        path: "/subscription",
        name: "सब्सक्रिप्शन",
        description: "मुफ्त, मासिक, या वार्षिक प्लान में से चुनें। कभी भी अपग्रेड या डाउनग्रेड करें। वार्षिक बिलिंग पर 20% तक की बचत।",
        howToAccess: "सेटिंग्स → सब्सक्रिप्शन देखें, या सीधे Subscription पर जाएं। लॉगिन आवश्यक है।",
      },
      billing: {
        path: "/billing",
        name: "बिलिंग",
        description: "सुरक्षित चेकआउट: क्रेडिट/डेबिट कार्ड, UPI, नेट बैंकिंग। सेव्ड कार्ड, GST इनवॉइस, और Razorpay-सुरक्षित लेनदेन।",
        howToAccess: "सब्सक्रिप्शन पेज पर प्लान चुनें, फिर बिलिंग पर जाएं। लॉगिन आवश्यक है।",
      },
      demo: {
        path: "/demo",
        name: "डेमो देखें",
        description: "सभी AgroIntel सुविधाओं का वीडियो वॉकथ्रू। लॉगिन आवश्यक नहीं।",
        howToAccess: "होम पेज पर 'डेमो देखें' बटन पर क्लिक करें।",
      },
      login: {
        path: "/login",
        name: "लॉगिन",
        description: "अपने ईमेल और पासवर्ड से साइन इन करें।",
        howToAccess: "नेविगेशन बार से 'लॉगिन' या 'साइन इन' पर क्लिक करें।",
      },
      signup: {
        path: "/signup",
        name: "साइन अप",
        description: "नाम, ईमेल और पासवर्ड के साथ नया AgroIntel अकाउंट बनाएं।",
        howToAccess: "होम पेज से 'साइन अप' या 'शुरू करें' पर क्लिक करें।",
      },
    },
    features: {
      weather: "रियल-टाइम मौसम डेटा और 5-दिवसीय पूर्वानुमान, मिट्टी का तापमान, आर्द्रता, हवा की गति, दबाव, बादल, और कृषि मौसम इनसाइट्स। मेट्रिक (°C) और इम्पीरियल (°F) समर्थित। शहर या पिन कोड से खोजें।",
      devices: "कनेक्टेड डिवाइस सेक्शन IoT सेंसर मॉनिटर करता है: सॉइल सेंसर (नमी, pH, NPK), तापमान मॉनिटर (हवा/मिट्टी तापमान, ड्यू पॉइंट), वेदर स्टेशन (हवा, आर्द्रता, दबाव), और लाइट सेंसर (PAR, Lux, UV)। बैटरी लेवल, सिग्नल स्ट्रेंथ, और लास्ट सिंक टाइम दिखाता है।",
      farmerPoints: "ऐप का उपयोग करके किसान पॉइंट्स कमाएं — मिट्टी डेटा चेक करें, फसल प्लान करें, बाज़ार ट्रेंड देखें। पॉइंट्स हीरो डैशबोर्ड पर दिखाई देते हैं। साप्ताहिक पॉइंट्स आपकी हालिया गतिविधि ट्रैक करते हैं।",
      language: "AgroIntel 3 भाषाओं का समर्थन करता है: English, Hindi (हिन्दी), Bengali (বাংলা)। सेटिंग्स → भाषा प्राथमिकता से बदलें। पूरा ऐप तुरंत बदल जाता है, संख्याएं भी देशी लिपि में।",
      darkMode: "सेटिंग्स → थीम से लाइट और डार्क थीम के बीच स्विच करें। थीम सभी पेजों पर तुरंत लागू होती है।",
      notifications: "सेटिंग्स → नोटिफिकेशन से पुश नोटिफिकेशन, ईमेल डाइजेस्ट (साप्ताहिक फ़ार्म सारांश), मौसम अलर्ट (गंभीर मौसम), और बाज़ार मूल्य अलर्ट कॉन्फ़िगर करें।",
      security: "256-बिट SSL एन्क्रिप्शन, Razorpay-सुरक्षित भुगतान, GDPR अनुपालन, एंड-टू-एंड एन्क्रिप्टेड फ़ार्म डेटा। AgroIntel कभी आपके डेटा पर ट्रेन नहीं करता या तीसरे पक्ष को नहीं बेचता।",
    },
    navigation: "डेस्कटॉप पर शीर्ष नेविगेशन बार या मोबाइल पर निचली नेविगेशन बार का उपयोग करें। पेज: डैशबोर्ड, मिट्टी विश्लेषण, फसल योजनाकार, बाज़ार, AI इनसाइट्स, प्रोफ़ाइल, सेटिंग्स। सर्च बार से कोई भी पेज तुरंत खोजें।",
    guestVsLoggedIn: "गेस्ट होम पेज प्रीव्यू (हीरो, अबाउट, डिवाइस प्रीव्यू, मार्केट प्रीव्यू) देख सकते हैं। मिट्टी विश्लेषण, फसल योजनाकार, बाज़ार डेटा, AI इनसाइट्स, प्रोफ़ाइल, सेटिंग्स, सब्सक्रिप्शन और बिलिंग के लिए साइन इन करना आवश्यक है।",
  },

  bn: {
    appName: "AgroIntel",
    overview:
      "AgroIntel একটি AI-চালিত নির্ভুল চাষ প্ল্যাটফর্ম। এটি মাটি বিশ্লেষণ, ফসল পরিকল্পনা, বাজার বুদ্ধিমত্তা, রিয়েল-টাইম আবহাওয়া ডেটা, সংযুক্ত ডিভাইস মনিটরিং, এবং কৃষক রিওয়ার্ড পয়েন্টস প্রদান করে — সব একটি ড্যাশবোর্ড থেকে।",
    pages: {
      dashboard: {
        path: "/",
        name: "ড্যাশবোর্ড (হোম)",
        description:
          "মূল ল্যান্ডিং পেজ। হিরো সেকশনে কৃষক পয়েন্টস, AI ইনসাইটস ব্যাজ, সংযুক্ত ডিভাইস স্ট্যাটাস, বাজার ইনসাইটস উইজেট, আবহাওয়া ওভারভিউ এবং সম্পর্কে সেকশন দেখায়।",
        howToAccess: "অ্যাপ খুলুন — এটি স্বয়ংক্রিয়ভাবে লোড হয়, অথবা নেভিগেশন বারে 'ড্যাশবোর্ড' ক্লিক করুন।",
      },
      soilAnalysis: {
        path: "/soil",
        name: "মাটি বিশ্লেষণ",
        description:
          "মাটির ল্যাব রিপোর্ট আপলোড করুন বা ম্যানুয়ালি মাটির প্যারামিটার দিন (pH, নাইট্রোজেন, ফসফরাস, পটাসিয়াম, অর্গানিক ম্যাটার, আর্দ্রতা, মাটির ধরন)। AI কয়েক সেকেন্ডে NPK সুপারিশ, pH সংশোধন পরিকল্পনা এবং ফলন পূর্বাভাস তৈরি করে।",
        howToAccess: "নেভিগেশন বারে 'মাটি বিশ্লেষণ' বা 'মাটি' ক্লিক করুন। লগিন প্রয়োজন।",
      },
      cropPlanner: {
        path: "/planner",
        name: "ফসল পরিকল্পনা",
        description:
          "মৌসুম-সচেতন, জলবায়ু-ক্যালিব্রেটেড বপন ক্যালেন্ডার। আবহাওয়া পূর্বাভাস, বৃদ্ধি টাইমলাইন, ফলন অনুমান এবং কাজ পরিচালনা অন্তর্ভুক্ত।",
        howToAccess: "নেভিগেশন বারে 'ফসল পরিকল্পনা' বা 'পরিকল্পনা' ক্লিক করুন। লগিন প্রয়োজন।",
      },
      market: {
        path: "/market",
        name: "বাজার ইনসাইটস",
        description:
          "পণ্যের দাম, চাহিদা প্রবণতা, আঞ্চলিক মণ্ডি দাম, ৭-দিনের মূল্য পূর্বাভাস এবং লাভের সুযোগ ট্র্যাক করুন।",
        howToAccess: "নেভিগেশন বারে 'বাজার' ক্লিক করুন। লগিন প্রয়োজন।",
      },
      aiInsights: {
        path: "/ai-insights",
        name: "AI ইনসাইটস",
        description: "আপনার খামারের জন্য AI-তৈরি ইনসাইটস — আর্দ্রতা অ্যালার্ট, কীটপতঙ্গ ভবিষ্যদ্বাণী, সর্বোত্তম ফসল কাটার সময়, এবং কার্যকর সুপারিশ।",
        howToAccess: "নেভিগেশনে 'AI ইনসাইটস' ক্লিক করুন। লগিন প্রয়োজন।",
      },
      profile: {
        path: "/profile",
        name: "প্রোফাইল",
        description: "আপনার ব্যক্তিগত তথ্য দেখুন ও সম্পাদনা করুন: নাম, ইমেল, ফোন, জন্ম তারিখ, লিঙ্গ, কৃষক ধরন, ভাষা পছন্দ, এবং প্রোফাইল ছবি। ট্যাব: ওভারভিউ, ফসল, জমি ও যন্ত্রপাতি, অর্থ, স্কিম, AI ইনসাইটস, নথি।",
        howToAccess: "নেভিগেশন বারে আপনার অবতার বা নামে ক্লিক করুন, তারপর 'প্রোফাইল' নির্বাচন করুন। লগিন প্রয়োজন।",
      },
      settings: {
        path: "/settings",
        name: "সেটিংস",
        description: "ভাষা পছন্দ (English, Hindi, Bengali), থিম (লাইট/ডার্ক), নোটিফিকেশন (পুশ, ইমেল, আবহাওয়া, বাজার অ্যালার্ট), গোপনীয়তা এবং অ্যাকাউন্ট পরিচালনা করুন।",
        howToAccess: "নেভিগেশন বারে গিয়ার আইকন বা 'সেটিংস' ক্লিক করুন। লগিন প্রয়োজন।",
      },
      subscription: {
        path: "/subscription",
        name: "সাবস্ক্রিপশন",
        description: "বিনামূল্যে, মাসিক, বা বার্ষিক প্ল্যান বেছে নিন। যেকোনো সময় আপগ্রেড বা ডাউনগ্রেড করুন। বার্ষিক বিলিংয়ে ২০% পর্যন্ত সঞ্চয়।",
        howToAccess: "সেটিংস → সাবস্ক্রিপশন দেখুন। লগিন প্রয়োজন।",
      },
      billing: {
        path: "/billing",
        name: "বিলিং",
        description: "নিরাপদ চেকআউট: ক্রেডিট/ডেবিট কার্ড, UPI, নেট ব্যাংকিং। সেভড কার্ড, GST ইনভয়েস, এবং Razorpay-সুরক্ষিত লেনদেন।",
        howToAccess: "সাবস্ক্রিপশন পেজে প্ল্যান নির্বাচন করুন, তারপর বিলিং-এ যান। লগিন প্রয়োজন।",
      },
      demo: {
        path: "/demo",
        name: "ডেমো দেখুন",
        description: "সমস্ত AgroIntel বৈশিষ্ট্যের ভিডিও ওয়াকথ্রু। লগিন প্রয়োজন নেই।",
        howToAccess: "হোম পেজে 'ডেমো দেখুন' বাটনে ক্লিক করুন।",
      },
      login: {
        path: "/login",
        name: "লগিন",
        description: "আপনার ইমেল এবং পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
        howToAccess: "নেভিগেশন বার থেকে 'লগিন' বা 'সাইন ইন' ক্লিক করুন।",
      },
      signup: {
        path: "/signup",
        name: "সাইন আপ",
        description: "নাম, ইমেল এবং পাসওয়ার্ড দিয়ে নতুন AgroIntel অ্যাকাউন্ট তৈরি করুন।",
        howToAccess: "হোম পেজ থেকে 'সাইন আপ' বা 'শুরু করুন' ক্লিক করুন।",
      },
    },
    features: {
      weather: "রিয়েল-টাইম আবহাওয়া ডেটা এবং ৫-দিনের পূর্বাভাস, মাটির তাপমাত্রা, আর্দ্রতা, বাতাসের গতি, চাপ, মেঘ, এবং কৃষি আবহাওয়া ইনসাইটস। মেট্রিক (°C) এবং ইম্পেরিয়াল (°F) সমর্থিত। শহর বা পিন কোড দিয়ে খুঁজুন।",
      devices: "সংযুক্ত ডিভাইস সেকশন IoT সেন্সর মনিটর করে: সয়েল সেন্সর (আর্দ্রতা, pH, NPK), তাপমাত্রা মনিটর (বায়ু/মাটি তাপমাত্রা, শিশির বিন্দু), ওয়েদার স্টেশন (বাতাস, আর্দ্রতা, চাপ), এবং লাইট সেন্সর (PAR, Lux, UV)। ব্যাটারি লেভেল, সিগন্যাল স্ট্রেংথ, এবং লাস্ট সিঙ্ক টাইম দেখায়।",
      farmerPoints: "অ্যাপ ব্যবহার করে কৃষক পয়েন্টস অর্জন করুন — মাটি ডেটা চেক করুন, ফসল পরিকল্পনা করুন, বাজার ট্রেন্ড দেখুন। পয়েন্টস হিরো ড্যাশবোর্ডে দেখা যায়। সাপ্তাহিক পয়েন্টস আপনার সাম্প্রতিক কার্যকলাপ ট্র্যাক করে।",
      language: "AgroIntel ৩টি ভাষা সমর্থন করে: English, Hindi (हिन्दी), Bengali (বাংলা)। সেটিংস → ভাষা পছন্দ থেকে পরিবর্তন করুন। পুরো অ্যাপ তাত্ক্ষণিকভাবে বদলে যায়, সংখ্যাও দেশীয় লিপিতে।",
      darkMode: "সেটিংস → থিম থেকে লাইট এবং ডার্ক থিমের মধ্যে স্যুইচ করুন। থিম সমস্ত পেজে তাত্ক্ষণিকভাবে প্রযোজ্য হয়।",
      notifications: "সেটিংস → নোটিফিকেশন থেকে পুশ নোটিফিকেশন, ইমেল ডাইজেস্ট (সাপ্তাহিক ফার্ম সারসংক্ষেপ), আবহাওয়া অ্যালার্ট (তীব্র আবহাওয়া), এবং বাজার মূল্য অ্যালার্ট কনফিগার করুন।",
      security: "২৫৬-বিট SSL এনক্রিপশন, Razorpay-সুরক্ষিত পেমেন্ট, GDPR কমপ্লায়েন্ট, এন্ড-টু-এন্ড এনক্রিপ্টেড ফার্ম ডেটা। AgroIntel কখনো আপনার ডেটায় ট্রেন করে না বা তৃতীয় পক্ষের কাছে বিক্রি করে না।",
    },
    navigation: "ডেস্কটপে টপ নেভিগেশন বার বা মোবাইলে বটম নেভিগেশন বার ব্যবহার করুন। পেজ: ড্যাশবোর্ড, মাটি বিশ্লেষণ, ফসল পরিকল্পনা, বাজার, AI ইনসাইটস, প্রোফাইল, সেটিংস। সার্চ বার দিয়ে যেকোনো পেজ দ্রুত খুঁজুন।",
    guestVsLoggedIn: "গেস্ট হোম পেজ প্রিভিউ (হিরো, সম্পর্কে, ডিভাইস প্রিভিউ, মার্কেট প্রিভিউ) দেখতে পারেন। মাটি বিশ্লেষণ, ফসল পরিকল্পনা, বাজার ডেটা, AI ইনসাইটস, প্রোফাইল, সেটিংস, সাবস্ক্রিপশন এবং বিলিং-এর জন্য সাইন ইন করতে হবে।",
  },
};

/* ═══════════════════════════════════════════════════════════════
   Intent-matching engine
   ═══════════════════════════════════════════════════════════════ */
const INTENT_PATTERNS = [
  // Page-specific
  { keywords: ["dashboard", "home", "main page", "ড্যাশবোর্ড", "হোম", "डैशबोर्ड", "होम"], page: "dashboard" },
  { keywords: ["soil", "mitti", "মাটি", "मिट्टी", "npk", "ph level", "nitrogen", "phosphorus", "potassium"], page: "soilAnalysis" },
  { keywords: ["crop", "planner", "plan season", "season", "ফসল", "পরিকল্পনা", "मৌসুম", "फसल", "योजना", "सीज़न", "মৌসুম"], page: "cropPlanner" },
  { keywords: ["market", "price", "mandi", "commodity", "বাজার", "মণ্ডি", "দাম", "बाज़ार", "मंडी", "कीमत"], page: "market" },
  { keywords: ["ai insight", "insight", "ইনসাইট", "इनसाइट", "ai analytics"], page: "aiInsights" },
  { keywords: ["profile", "account info", "my account", "প্রোফাইল", "अকাউন্ট", "प्रोफ़ाइल", "अकाउंट"], page: "profile" },
  { keywords: ["setting", "preference", "সেটিংস", "পছন্দ", "सेटिंग", "पसंद"], page: "settings" },
  { keywords: ["subscription", "plan", "pricing", "upgrade", "সাবস্ক্রিপশন", "প্ল্যান", "सब्सक्रिप्शन", "प्लान"], page: "subscription" },
  { keywords: ["billing", "payment", "pay", "checkout", "বিলিং", "পেমেন্ট", "बिलिंग", "भुगतान"], page: "billing" },
  { keywords: ["demo", "watch demo", "ডেমো", "डेमो"], page: "demo" },
  { keywords: ["login", "sign in", "signin", "log in", "লগিন", "সাইন ইন", "लॉगिन", "साइन इन"], page: "login" },
  { keywords: ["signup", "sign up", "register", "create account", "সাইন আপ", "নিবন্ধন", "साइन अप", "रजिस्टर", "अकाउंट बनाएं"], page: "signup" },

  // Features
  { keywords: ["weather", "forecast", "temperature", "rain", "আবহাওয়া", "পূর্বাভাস", "বৃষ্টি", "मौसम", "तापमान", "बारिश"], feature: "weather" },
  { keywords: ["device", "sensor", "iot", "connected", "ডিভাইস", "সেন্সর", "সংযুক্ত", "डिवाइस", "सेंसर", "कनेक्टेड"], feature: "devices" },
  { keywords: ["point", "reward", "score", "পয়েন্ট", "পুরস্কার", "স্কোর", "पॉइंट", "अंक", "इनाम"], feature: "farmerPoints" },
  { keywords: ["language", "translate", "ভাষা", "অনুবাদ", "भाषा", "अनुवाद", "hindi", "bengali", "english"], feature: "language" },
  { keywords: ["dark", "theme", "light mode", "dark mode", "appearance", "ডার্ক", "থিম", "চেহারা", "डार्क", "थीम", "रूप"], feature: "darkMode" },
  { keywords: ["notification", "alert", "নোটিফিকেশন", "অ্যালার্ট", "बিজ্ঞপ্তি", "नोटिफिकेशन", "अलर्ट", "সতর্কতা"], feature: "notifications" },
  { keywords: ["security", "encryption", "privacy", "safe", "নিরাপত্তা", "এনক্রিপশন", "গোপনীয়তা", "सुरक्षा", "गोपनीयता"], feature: "security" },

  // General
  { keywords: ["navigate", "go to", "open", "how to access", "where", "find", "কোথায়", "খুঁজুন", "কীভাবে যাব", "कहाँ", "कैसे जाएं", "खोजें"], intent: "navigation" },
  { keywords: ["what is", "about", "overview", "tell me about", "কী", "সম্পর্কে", "বলুন", "परिचय", "क्या है", "बताएं", "बताओ"], intent: "overview" },
  { keywords: ["guest", "without login", "without sign", "no account", "গেস্ট", "লগিন ছাড়া", "অ্যাকাউন্ট ছাড়া", "बिना लॉगिन", "मेहमान", "बिना अकाउंट"], intent: "guestVsLoggedIn" },
  { keywords: ["help", "how to use", "guide", "tutorial", "all page", "সাহায্য", "কীভাবে ব্যবহার", "গাইড", "সব পেজ", "सहायता", "कैसे इस्तेमाल", "गाइड", "मदद", "सब पेज"], intent: "help" },
];

function matchIntent(query, language) {
  const q = query.toLowerCase().trim();
  const kb = APP_KNOWLEDGE[language] || APP_KNOWLEDGE.en;

  for (const pattern of INTENT_PATTERNS) {
    const matched = pattern.keywords.some((kw) => q.includes(kw.toLowerCase()));
    if (!matched) continue;

    if (pattern.page && kb.pages[pattern.page]) {
      const pg = kb.pages[pattern.page];
      return `📄 ${pg.name} (${pg.path})\n\n${pg.description}\n\n🔗 ${pg.howToAccess}`;
    }

    if (pattern.feature && kb.features[pattern.feature]) {
      return `✨ ${kb.features[pattern.feature]}`;
    }

    if (pattern.intent === "navigation") {
      return kb.navigation;
    }
    if (pattern.intent === "overview") {
      return kb.overview;
    }
    if (pattern.intent === "guestVsLoggedIn") {
      return kb.guestVsLoggedIn;
    }
    if (pattern.intent === "help") {
      const pageList = Object.values(kb.pages)
        .map((p) => `• ${p.name} → ${p.path}`)
        .join("\n");
      const helpIntro = {
        en: "Here are all the pages in AgroIntel:\n\n",
        hi: "AgroIntel के सभी पेज यहाँ हैं:\n\n",
        bn: "AgroIntel-এর সমস্ত পেজ এখানে:\n\n",
      };
      return (helpIntro[language] || helpIntro.en) + pageList;
    }
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   Typing effect component
   ═══════════════════════════════════════════════════════════════ */
const TypingEffect = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    if (indexRef.current < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      }, 18);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [displayedText, text, onComplete]);

  return (
    <>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-emerald-600 animate-pulse" />
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TTS Button Component
   ═══════════════════════════════════════════════════════════════ */
const SpeakButton = ({ text, language, t }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      toast.error(t("quickAi.ttsNotSupported"), {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const cleanText = text
      .replace(/[📄✨🔗•→]/g, "")
      .replace(/\*\*/g, "")
      .replace(/\n+/g, ". ");
    speakText(cleanText, language, () => setIsSpeaking(false));
  };

  return (
    <button
      onClick={handleSpeak}
      className={`mt-1 p-1 rounded-md transition-colors ${
        isSpeaking
          ? "text-red-500 hover:bg-red-50 animate-pulse"
          : "text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
      }`}
      title={isSpeaking ? t("quickAi.stopSpeaking") : t("quickAi.speakTooltip")}
    >
      {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Main Chat Component
   ═══════════════════════════════════════════════════════════════ */
export default function PremiumAiChat() {
  const { t, language } = useLanguage();

  const SUGGESTIONS = [
    {
      icon: <HelpCircle size={14} />,
      label: t("quickAi.howToUse"),
      prompt:
        language === "hi"
          ? "मुझे ऐप कैसे इस्तेमाल करें बताएं"
          : language === "bn"
            ? "আমাকে অ্যাপ কীভাবে ব্যবহার করতে হয় বলুন"
            : "Help me use this app",
    },
    {
      icon: <BookOpen size={14} />,
      label: t("quickAi.appGuide"),
      prompt:
        language === "hi"
          ? "AgroIntel क्या है? इसकी सुविधाएं बताएं"
          : language === "bn"
            ? "AgroIntel কী? এর বৈশিষ্ট্য বলুন"
            : "What is AgroIntel and its features?",
    },
    {
      icon: <Compass size={14} />,
      label: t("quickAi.navigation"),
      prompt:
        language === "hi"
          ? "मुझे सभी पेज दिखाओ और कैसे पहुँचें"
          : language === "bn"
            ? "আমাকে সব পেজ দেখান এবং কীভাবে যেতে হবে"
            : "Show me all pages and how to navigate",
    },
    {
      icon: <Zap size={14} />,
      label: t("quickAi.features"),
      prompt:
        language === "hi"
          ? "मौसम, डिवाइस, और किसान पॉइंट्स के बारे में बताएं"
          : language === "bn"
            ? "আবহাওয়া, ডিভাইস, এবং কৃষক পয়েন্টস সম্পর্কে বলুন"
            : "Tell me about weather, devices, and farmer points",
    },
  ];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: t("quickAi.welcomeMsg"),
      isTyping: false,
    },
  ]);
  const [pos, setPos] = useState({
    x: window.innerWidth - 420,
    y: window.innerHeight - 100,
  });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const [typingMessageId, setTypingMessageId] = useState(null);

  // Ensure voices are loaded (Chrome loads them async)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () =>
        window.speechSynthesis.getVoices();
    }
  }, []);

  // Stop TTS when chat closes
  useEffect(() => {
    if (!open && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [open]);

  // Speech to Text
  const startSpeechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t("quickAi.speechNotSupported"), {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = TTS_LANG_MAP[language] || "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const sendMessage = (text) => {
    if (!text?.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text, isTyping: false }]);
    setInput("");

    setTimeout(() => {
      let replyText = matchIntent(text, language);

      if (!replyText) {
        const q = text.toLowerCase();
        const kb = APP_KNOWLEDGE[language] || APP_KNOWLEDGE.en;

        if (
          q.includes("agrointel") ||
          q.includes("app") ||
          q.includes("অ্যাপ") ||
          q.includes("ऐप") ||
          q.includes("what") ||
          q.includes("কী") ||
          q.includes("क्या")
        ) {
          replyText = kb.overview;
        }
      }

      if (!replyText) {
        replyText = t("quickAi.defaultResponse");
      }

      const newMessageId = Date.now();
      setTypingMessageId(newMessageId);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: replyText,
          id: newMessageId,
          isTyping: true,
        },
      ]);
    }, 600);
  };

  const handleTypingComplete = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg,
      ),
    );
    setTypingMessageId(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onMouseDown = (e) => {
    if (e.target.closest(".no-drag")) return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const onTouchStart = (e) => {
    if (e.target.closest(".no-drag")) return;
    const touch = e.touches[0];
    setDragging(true);
    dragOffset.current = {
      x: touch.clientX - pos.x,
      y: touch.clientY - pos.y,
    };
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const touchMove = (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
      setPos({
        x: touch.clientX - dragOffset.current.x,
        y: touch.clientY - dragOffset.current.y,
      });
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", up);
    };
  }, [dragging]);

  return (
    <div
      className="fixed z-[9999] font-sans"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* ── CHAT PANEL ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute bottom-20 right-0 w-[min(380px,calc(100vw-2rem))] bg-white border border-emerald-100 rounded-md shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="p-5 border-b border-dashed border-emerald-100 flex items-center justify-between cursor-grab active:cursor-grabbing bg-emerald-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <img
                    src="./logo-brows.png"
                    alt="logo"
                    className="w-8 h-8 object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-emerald-900 text-[13px] font-semibold tracking-tight leading-none">
                    {t("quickAi.title")}
                  </h3>
                  <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold mt-1">
                    {t("quickAi.systemsActive")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="no-drag p-2 hover:bg-emerald-100 rounded-lg text-emerald-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Area */}
            <div className="h-[320px] overflow-y-auto p-5 space-y-5 no-scrollbar bg-gradient-to-br from-emerald-50/30 via-white to-white">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${m.role === "user" ? "" : "flex flex-col"}`}>
                    <div
                      className={`p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                        m.role === "user"
                          ? "bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-200"
                          : "bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-bl-none"
                      }`}
                    >
                      {m.role === "ai" && m.isTyping ? (
                        <TypingEffect
                          text={m.text}
                          onComplete={() => handleTypingComplete(m.id)}
                        />
                      ) : (
                        m.text
                      )}
                    </div>
                    {/* TTS button for AI messages */}
                    {m.role === "ai" && !m.isTyping && (
                      <div className="flex justify-start mt-0.5">
                        <SpeakButton text={m.text} language={language} t={t} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typingMessageId && (
                <div className="flex justify-start">
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-bl-none p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <span
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Separator */}
            <div className="border-t border-dashed border-emerald-100 mx-5" />

            {/* Quick Chips */}
            <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar no-drag">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.prompt)}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] hover:bg-emerald-100 hover:border-emerald-200 transition-all"
                >
                  {s.icon} <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-5 pt-0 no-drag">
              <div className="relative flex items-end gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl p-2 focus-within:border-emerald-300 transition-all">
                <button
                  onClick={startSpeechToText}
                  className={`p-2 rounded-xl transition-colors ${
                    isListening
                      ? "bg-red-100 text-red-500 animate-pulse"
                      : "text-emerald-400 hover:text-emerald-600"
                  }`}
                >
                  <Mic size={18} />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), sendMessage(input))
                  }
                  placeholder={t("quickAi.askPlaceholder")}
                  className="w-full bg-transparent border-none outline-none text-[13px] text-emerald-900 placeholder-emerald-300 py-2 resize-none max-h-32"
                  rows={1}
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex justify-center mt-3">
                <p className="text-[9px] text-emerald-300 font-mono tracking-widest uppercase italic">
                  {t("quickAi.secureConnection")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TRIGGER BUTTON ── */}
      <motion.button
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={() => !dragging && setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-md flex items-center justify-center shadow-lg transition-all duration-300 ${
          open ? "bg-white border border-emerald-200 text-emerald-600" : ""
        }`}
      >
        {open ? (
          <img src="./logo.svg" alt="logo" className="w-8 h-8 object-cover" />
        ) : (
          <img
            src="./logo-brows.png"
            alt="logo"
            className="w-8 h-8 object-cover"
          />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-md border-4 border-emerald-600" />
        )}
      </motion.button>
    </div>
  );
}
