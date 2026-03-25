import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Gauge,
  Cloud,
  Eye,
  Umbrella,
  Sunrise,
  Sunset,
  Navigation,
  RefreshCw,
  Lock, // Added for the lock icon
} from "lucide-react";
import { VIDEOS } from "../assets/assets";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";

const API_KEY = "f3c2fd8450511f601214ae46ff61a60b";
const BASE = "https://api.openweathermap.org/data/2.5";

/* ── Typography & Style Constants ── */
const FONT_CORMORANT = "'Cormorant Garamond', serif";
const FONT_DM = "'DM Sans', sans-serif";

const fmtTime = (unix, tz = 0) => {
  const d = new Date((unix + tz) * 1000);
  return d.toUTCString().slice(17, 22);
};

const getWeatherVideo = (weatherCode, isDay) => {
  if (weatherCode >= 200 && weatherCode < 300) return VIDEOS.thunder;
  if (
    (weatherCode >= 300 && weatherCode < 400) ||
    (weatherCode >= 500 && weatherCode < 600)
  )
    return VIDEOS.rainy;
  if (weatherCode === 800) return isDay ? VIDEOS.sunlight : VIDEOS.moonlight;
  return VIDEOS.cloudy;
};

const getConditionStyles = (code) => {
  if (code >= 200 && code < 600)
    return {
      color: "text-blue-600",
      bg: "bg-blue-50/80 backdrop-blur-sm",
      border: "border-blue-100",
    };
  if (code === 800)
    return {
      color: "text-amber-600",
      bg: "bg-amber-50/80 backdrop-blur-sm",
      border: "border-amber-100",
    };
  return {
    color: "text-green-600",
    bg: "bg-green-50/80 backdrop-blur-sm",
    border: "border-green-100",
  };
};

export default function AgroWeatherPremium({ isLoggedIn: isLoggedInProp }) {
  const { isAuthenticated } = useUser();
  const { t, n } = useLanguage();
  const isLoggedIn =
    typeof isLoggedInProp === "boolean" ? isLoggedInProp : isAuthenticated;
  const [searchInput, setSearchInput] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unitC, setUnitC] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const videoRef = useRef(null);

  /**
   * Save weather data to backend database
   */
  const saveWeatherToDatabase = useCallback(async (weatherData, location) => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch('http://localhost:4000/api/weather/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          temperature: weatherData.main.temp,
          feelsLike: weatherData.main.feels_like,
          tempMin: weatherData.main.temp_min,
          tempMax: weatherData.main.temp_max,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          windSpeed: weatherData.wind.speed,
          windDegree: weatherData.wind.deg || 0,
          cloudCoverage: weatherData.clouds.all,
          visibility: weatherData.visibility,
          rainfall: weatherData.rain?.['1h'] || 0,
          rainProbability: 0,
          weatherCondition: {
            main: weatherData.weather[0].main,
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon
          },
          sunrise: new Date(weatherData.sys.sunrise * 1000),
          sunset: new Date(weatherData.sys.sunset * 1000),
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: weatherData.name,
            city: weatherData.name,
            state: weatherData.sys?.state || '',
            country: weatherData.sys.country,
            zipcode: weatherData.cod
          }
        })
      });

      if (response.ok) {
        console.log('✅ Weather data saved to database');
      } else {
        console.error('Failed to save weather data');
      }
    } catch (error) {
      console.error('Error saving weather to database:', error);
    }
  }, [isLoggedIn]);

  const fetchData = useCallback(async (query, location) => {
    setLoading(true);
    try {
      const [curRes, frcRes] = await Promise.all([
        fetch(`${BASE}/weather?${query}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE}/forecast?${query}&units=metric&appid=${API_KEY}`),
      ]);
      const curData = await curRes.json();
      const frcData = await frcRes.json();

      setCurrent(curData);
      
      // Save weather data to database
      if (location) {
        saveWeatherToDatabase(curData, location);
      }

      const days = {};
      frcData.list.forEach((h) => {
        const d = new Date(h.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (!days[d])
          days[d] = {
            high: h.main.temp_max,
            low: h.main.temp_min,
            icon: h.weather[0].icon,
          };
      });
      setForecast(
        Object.entries(days)
          .map(([day, v]) => ({ day, ...v }))
          .slice(0, 5),
      );
    } catch (e) {
      console.error("Failed to fetch weather", e);
    } finally {
      setLoading(false);
    }
  }, [saveWeatherToDatabase]);

  /* ── Search handler ── */
  const handleSearch = useCallback(() => {
    const city = searchInput.trim();
    if (!city) return;
    fetchData(`q=${encodeURIComponent(city)}`, null);
  }, [searchInput, fetchData]);

  useEffect(() => {
    if (!isLoggedIn) {
      setCurrent(null);
      setForecast([]);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setUserLocation(location);
        fetchData(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`, location);
      },
      () => {
        // Fallback to default location if geolocation fails
        const defaultLocation = { latitude: 22.5726, longitude: 88.3639 };
        setUserLocation(defaultLocation);
        fetchData(`q=Kolkata`, defaultLocation);
      },
    );
  }, [fetchData, isLoggedIn]);

  const currentVideo = current
    ? getWeatherVideo(
        current.weather[0].id,
        current.weather[0].icon?.includes("d"),
      )
    : VIDEOS.sunlight;
  const styles = current
    ? getConditionStyles(current.weather[0].id)
    : getConditionStyles(800);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500;700&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden min-h-[400px]"
        >
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full">
            <video
              ref={videoRef}
              key={currentVideo}
              autoPlay
              muted
              loop
              playsInline
              className="absolute min-w-full min-h-full object-cover"
            >
              <source src={currentVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* ── CONDITIONAL BLUR OVERLAY ── */}
          {!isLoggedIn && (
            <div className="absolute inset-0 z-36 flex items-center justify-center p-6 backdrop-blur-xl bg-black/10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/90 backdrop-blur-md p-8 rounded-[24px] shadow-2xl max-w-sm text-center border border-white/50"
              >
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-green-600" size={24} />
                </div>
                <h3 className="font-cormorant text-2xl font-bold text-gray-800 mb-2">
                  {t("weather.premiumTitle")}
                </h3>
                <p className="font-dm text-sm text-gray-500 mb-6 leading-relaxed">
                  {t("weather.premiumDesc")}
                </p>
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-dm font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
                >
                  {t("weather.loginToAccess")}
                </button>
                <p className="mt-4 font-dm text-[11px] text-gray-400 uppercase tracking-widest">
                  {t("weather.secureFarmData")}
                </p>
              </motion.div>
            </div>
          )}

          {/* Main Content (Blurred if !isLoggedIn) */}
          <div
            className={`relative z-10 flex flex-col md:flex-row ${!isLoggedIn ? "select-none pointer-events-none" : ""}`}
          >
            {/* LEFT SECTION */}
            <div className="w-full md:w-[70%] p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="relative flex-1 group">
                  <Search
                    size={15}
                    onClick={handleSearch}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors cursor-pointer"
                  />
                  <input
                    type="text"
                    disabled={!isLoggedIn}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t("weather.searchPlaceholder")}
                    className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl py-2.5 pl-11 pr-4 text-[13px] font-dm text-white placeholder-white/70 outline-none focus:border-white/50 focus:bg-white/30 transition-all"
                  />
                </div>
                <button className="px-4 py-2.5 rounded-xl border border-white/30 bg-white/20 backdrop-blur-md text-[11px] font-dm font-bold tracking-widest text-white uppercase">
                  {unitC ? t("weather.metric") : t("weather.imperial")}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {current && !loading ? (
                  <motion.div
                    key={current.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                      <div>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${styles.bg} ${styles.border} mb-4`}
                        >
                          <Navigation size={10} className={styles.color} />
                          <span
                            className={`font-dm text-[10px] font-bold uppercase tracking-wider ${styles.color}`}
                          >
                            {current.name}, {current.sys.country}
                          </span>
                        </div>
                        <h2
                          style={{ fontFamily: FONT_CORMORANT }}
                          className="text-6xl sm:text-7xl font-bold text-white leading-none tracking-tighter"
                        >
                          {n(Math.round(current.main.temp))}°
                        </h2>
                        <p className="font-dm text-white/90 text-[15px] mt-2 font-light capitalize">
                          {current.weather[0].description} • {t("weather.feelsLike")}{" "}
                          {n(Math.round(current.main.feels_like))}°
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
                        {[
                          {
                            label: t("weather.humidity"),
                            val: `${n(current.main.humidity)}%`,
                            icon: <Droplets size={16} />,
                          },
                          {
                            label: t("weather.wind"),
                            val: `${n(current.wind.speed)} m/s`,
                            icon: <Wind size={16} />,
                          },
                          {
                            label: t("weather.pressure"),
                            val: `${n(current.main.pressure)} hPa`,
                            icon: <Gauge size={16} />,
                          },
                          {
                            label: t("weather.clouds"),
                            val: `${n(current.clouds.all)}%`,
                            icon: <Cloud size={16} />,
                          },
                        ].map((stat, i) => (
                          <div
                            key={i}
                            className="flex-shrink-0 flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl min-w-[160px]"
                          >
                            <div className="text-white bg-white/20 p-2.5 rounded-xl border border-white/30">
                              {stat.icon}
                            </div>
                            <div>
                              <p className="font-dm text-[10px] text-white/80 font-bold uppercase tracking-widest leading-none mb-1.5">
                                {stat.label}
                              </p>
                              <p className="font-dm text-sm font-bold text-white">
                                {stat.val}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-white" size={32} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT SECTION */}
            <div className="w-full md:w-[30%] bg-black/20 backdrop-blur-md p-6 sm:p-10 border-l border-dashed border-white/30">
              <h3 className="font-dm text-[11px] font-bold text-white/80 uppercase tracking-[0.2em] mb-8">
                {t("weather.fiveDayOutlook")}
              </h3>
              <div className="space-y-6">
                {forecast.map((day, i) => (
                  <div
                    key={day.day}
                    className="flex items-center justify-between"
                  >
                    <span className="font-dm text-[13px] font-medium text-white/80 w-10">
                      {day.day}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      className="w-8 h-8 brightness-0 invert opacity-80"
                      alt="weather"
                    />
                    <div className="flex gap-3 font-dm text-[13px]">
                      <span className="font-bold text-white">
                        {n(Math.round(day.high))}°
                      </span>
                      <span className="text-white/50">
                        {n(Math.round(day.low))}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
