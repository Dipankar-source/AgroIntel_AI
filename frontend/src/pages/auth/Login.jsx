// pages/auth/Login.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Globe, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useUser } from "../../context/UserContext"; // Import useUser
import { useLanguage, SUPPORTED_LANGUAGES } from "../../context/LanguageContext";

const LOTTIE_URLS = {
  hero: "/lottie/plant.json",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ── Divider ── */
const Divider = ({ label }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />
    <span className="text-[10.5px] font-dm uppercase tracking-[0.2em] text-gray-400 shrink-0">
      {label}
    </span>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />
  </div>
);

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("preferredLanguage") || "en"
  );
  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [step, setStep] = useState("LOGIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lottieData, setLottieData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Use the user context
  const { login, verifyOTP, resendOTP } = useUser();
  const { setLanguage } = useLanguage();

  React.useEffect(() => {
    fetch(LOTTIE_URLS.hero)
      .then((r) => r.json())
      .then(setLottieData)
      .catch(() => setLottieData(null));
  }, []);

  axios.defaults.withCredentials = true;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await login(form.email, form.password);

      if (result?.requiresOTP) {
        setOtpForm({ ...otpForm, email: result.email || form.email });
        setStep("OTP");
        setSuccess(result.message || "Verification code sent to your email!");
      } else if (result?.success) {
        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(result?.error || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await verifyOTP(otpForm.email, otpForm.otp);

      if (result?.success) {
        // Persist chosen language
        localStorage.setItem("preferredLanguage", selectedLanguage);
        setLanguage(selectedLanguage);

        // Required: console the user data on browser
        console.log("✅ User after OTP verify:", result.user);
        setSuccess("Login successful! Redirecting to manual tour...");
        setTimeout(() => {
          navigate("/how-to-use");
        }, 1500);
      } else {
        setError(result?.error || "OTP verification failed");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await resendOTP(otpForm.email, form.password);

      if (result?.success) {
        setSuccess(result.message || "New OTP sent to your email!");
      } else {
        setError(result?.error || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("LOGIN");
    setError("");
    setSuccess("");
    setOtpForm({ email: "", otp: "" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm        { font-family: 'DM Sans', sans-serif; }
        * { font-family: 'DM Sans', sans-serif; }

        .agro-field {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border-radius: 13px;
          border: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.9);
          font-size: 13.5px;
          color: #374151;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .agro-field::placeholder { color: #d1d5db; }
        .agro-field:focus {
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.14);
        }
        .agro-select {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border-radius: 13px;
          border: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.9);
          font-size: 13.5px;
          color: #374151;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          appearance: none;
          cursor: pointer;
        }
        .agro-select:focus {
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.14);
        }
        
        .otp-field {
          width: 100%;
          padding: 11px 14px;
          border-radius: 13px;
          border: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.9);
          font-size: 16px;
          color: #374151;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          text-align: center;
          letter-spacing: 8px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .otp-field:focus {
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.14);
        }
        
        .error-message {
          background-color: #fee2e2;
          border: 1px solid #ef4444;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12px;
          margin-bottom: 16px;
        }
        
        .success-message {
          background-color: #dcfce7;
          border: 1px solid #4ade80;
          color: #166534;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12px;
          margin-bottom: 16px;
        }
      `}</style>

      {/* ════ PAGE WRAPPER ════ */}
      <div className="relative min-h-screen flex items-stretch overflow-hidden">
        {/* ════ LEFT PANEL ════ */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-8">
          {/* ── Login/OTP Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[400px] bg-white rounded-[24px] p-5
                       border border-gray-100
                       shadow-[0_8px_40px_rgba(16,185,129,0.10)]"
          >
            {/* ── Header ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="flex flex-col items-center mb-7"
            >
              {/* Logo — mobile only */}
              <div
                className="lg:hidden w-11 h-11 rounded-[14px]
                           flex items-center justify-center
                           shadow-[0_4px_16px_rgba(22,163,74,0.25)] mb-4"
              >
                <img src="./logo-brows.png" alt="logo" className="w-8 h-8" />
              </div>

              {step === "LOGIN" ? (
                <>
                  <h2 className="font-cormorant text-[2.1rem] font-bold text-gray-800 leading-none tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="font-dm font-light text-gray-400 text-[11.5px] mt-1.5 tracking-widest uppercase">
                    AgroIntel AI Platform
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-cormorant text-[2.1rem] font-bold text-gray-800 leading-none tracking-tight">
                    Verify OTP
                  </h2>
                  <p className="font-dm font-light text-gray-400 text-[11.5px] mt-1.5 tracking-widest uppercase">
                    Enter the 6-digit code sent to {otpForm.email}
                  </p>
                </>
              )}
            </motion.div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="success-message"
              >
                {success}
              </motion.div>
            )}

            {/* ── Divider ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-7"
            >
              <Divider label={step === "LOGIN" ? "Log In" : "Verification"} />
            </motion.div>

            {/* ── Form ── */}
            {step === "LOGIN" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32, duration: 0.45 }}
                  className="relative"
                >
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                    size={15}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="agro-field"
                    disabled={loading}
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.45 }}
                  className="relative"
                >
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                    size={15}
                  />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="agro-field pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </motion.div>

                {/* Preferred Language */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.44, duration: 0.45 }}
                  className="relative"
                >
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                    size={15}
                  />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      localStorage.setItem("preferredLanguage", e.target.value);
                    }}
                    className="agro-select"
                    disabled={loading}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                  </select>
                </motion.div>

                {/* Forgot password */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.46 }}
                  className="flex justify-end"
                >
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="font-dm text-[12px] text-green-600 hover:underline transition-colors"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </motion.div>

                {/* Submit */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.52 }}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: loading ? 1 : 0.975 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-[13px]
                           bg-gradient-to-r from-green-600 to-emerald-500
                           text-white font-dm font-medium text-[14px] tracking-wide
                           shadow-[0_4px_16px_rgba(22,163,74,0.25)]
                           transition-shadow duration-200 border-none cursor-pointer
                           ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Sending OTP..." : "Log In"}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4 md:mx-auto">
                {/* OTP Input */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32, duration: 0.45 }}
                >
                  <InputOTP
                    maxLength={6}
                    value={otpForm.otp}
                    onChange={(value) => setOtpForm({ ...otpForm, otp: value })}
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
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    OTP expires in 5 minutes
                  </p>
                </motion.div>

                {/* Verify OTP Button */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: loading ? 1 : 0.975 }}
                  type="submit"
                  disabled={loading || otpForm.otp.length !== 6}
                  className={`w-full py-3 rounded-[13px]
                           bg-gradient-to-r from-green-600 to-emerald-500
                           text-white font-dm font-medium text-[14px] tracking-wide
                           shadow-[0_4px_16px_rgba(22,163,74,0.25)]
                           transition-shadow duration-200 border-none cursor-pointer
                           ${loading || otpForm.otp.length !== 6 ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>

                {/* Resend OTP and Back links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.46 }}
                  className="flex items-center justify-between mt-4"
                >
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="font-dm text-[12px] text-gray-500 hover:text-green-600 transition-colors"
                    disabled={loading}
                  >
                   Back to Login
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="font-dm text-[12px] text-green-600 hover:underline transition-colors"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </motion.div>
              </form>
            )}

            {/* ── Divider (only show on login step) ── */}
            {step === "LOGIN" && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.58 }}
                  className="my-6"
                >
                  <Divider label="or continue with" />
                </motion.div>

                {/* ── Google ── */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.63 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.975 }}
                  type="button"
                  onClick={() =>
                    (window.location.href = `${API_URL}/api/auth/google`)
                  }
                  className="w-full flex items-center justify-center gap-2.5 py-3
                           border border-gray-200 rounded-[13px] bg-white
                           font-dm font-medium text-[13.5px] text-gray-600
                           shadow-sm hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <FaGoogle className="text-red-500" size={14} />
                  Login with Google
                </motion.button>
              </>
            )}

            {/* ── Sign up redirect ── */}
            {step === "LOGIN" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.68 }}
                className="text-center font-dm font-light text-[12.5px] text-gray-400 mt-5"
              >
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-green-600 font-medium hover:underline cursor-pointer transition-colors"
                >
                  Sign up
                </span>
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between
                     overflow-hidden bg-emerald-50 border border-white/30 rounded-md
                     p-10 xl:p-14"
        >
          {/* Subtle dot grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* ── Brand mark ── */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-12"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <img src="./logo-brows.png" alt="logo" className="w-7 h-7" />
              </div>
              <div>
                <p className="font-cormorant text-green-700 text-xl font-bold leading-none tracking-tight">
                  AgroIntel
                </p>
                <p className="font-dm text-emerald-400 text-[10px] uppercase tracking-widest mt-0.5">
                  AI Platform
                </p>
              </div>
            </motion.div>

            {/* ── Headline ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <h1 className="font-cormorant text-green-800 text-[2.8rem] xl:text-[3.2rem] font-bold leading-[1.05] tracking-tight mb-4">
                {step === "LOGIN" ? (
                  <>
                    Welcome back to
                    <br />
                    <span className="text-green-600 tracking-wide">
                      smarter farming
                    </span>
                  </>
                ) : (
                  <>
                    Verify your
                    <br />
                    <span className="text-green-600 tracking-wide">
                      secure login
                    </span>
                  </>
                )}
              </h1>
              <p className="font-dm font-light text-emerald-500 text-[13.5px] leading-relaxed max-w-xs">
                {step === "LOGIN"
                  ? "Continue your journey with AI-powered insights for better crop management and higher yields."
                  : "We've sent a one-time password to your email. Enter it to complete your secure login."}
              </p>
            </motion.div>
          </div>

          {/* ── Lottie animation ── */}
          <div className="relative z-10 flex justify-center my-2">
            <div className="w-96 xl:w-[68rem] drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
              {lottieData ? (
                <Lottie animationData={lottieData} loop autoplay />
              ) : (
                <svg
                  viewBox="0 0 200 200"
                  className="w-full opacity-90"
                  fill="none"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="55"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M100 140 Q80 100 100 70 Q120 100 100 140"
                    stroke="#6ee7b7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="rgba(110,231,183,0.15)"
                  />
                  <line
                    x1="100"
                    y1="140"
                    x2="100"
                    y2="165"
                    stroke="#6ee7b7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <ellipse
                    cx="100"
                    cy="168"
                    rx="16"
                    ry="6"
                    fill="rgba(110,231,183,0.2)"
                  />
                </svg>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
