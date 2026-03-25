import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Leaf, Globe, Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import axios from "axios";
import FileUpload from "../../components/ui/file-upload";

const LOTTIE_URLS = {
  hero: "/lottie/agro.json",
};

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

/* ════════════════════════════════════════════
   MAIN SIGNUP COMPONENT
════════════════════════════════════════════ */
const SignUp = () => {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    farmerType: "Small Farmer",
    language: localStorage.getItem("preferredLanguage") || "en",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lottieData, setLottieData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-orange-400" };
    if (score <= 3) return { level: 3, label: "Good", color: "bg-yellow-400" };
    if (score <= 4) return { level: 4, label: "Strong", color: "bg-green-500" };
    return { level: 5, label: "Very Strong", color: "bg-emerald-600" };
  };

  const passwordStrength = getPasswordStrength(form.password);
  const navigate = useNavigate();

  // API base URL
  const API_BASE_URL = "http://localhost:4000";

  React.useEffect(() => {
    fetch(LOTTIE_URLS.hero)
      .then((r) => r.json())
      .then(setLottieData)
      .catch(() => setLottieData(null));
  }, []);

  const addFiles = (incoming) => {
    const deduped = Array.from(incoming).filter(
      (f) => !files.some((e) => e.name === f.name),
    );
    setFiles((prev) => [...prev, ...deduped]);
  };

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("fullName", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("farmerType", form.farmerType);
      formData.append("language", form.language);

      // Append files if any
      files.forEach((file, index) => {
        formData.append("documents", file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        formData,
        {
          withCredentials: true,
        },
      );

      console.log("Response:", response.data);
      // Persist chosen language to localStorage
      localStorage.setItem("preferredLanguage", form.language);

      setSuccess("Registration successful! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      if (err.response) {
        setError(
          err.response.data.msg || "Registration failed. Please try again.",
        );
      } else if (err.request) {
        // Request made but no response
        setError("Network error. Please check your connection.");
      } else {
        // Something else happened
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-dm        { font-family: 'DM Sans', sans-serif; }
        * { font-family: 'DM Sans', sans-serif; }

        .agro-field {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border-radius: 13px;
          border: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.88);
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
          background: rgba(255,255,255,0.88);
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
        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 16px;
          padding: 10px;
          background-color: #fee2e2;
          border-radius: 8px;
          text-align: center;
        }
        .success-message {
          color: #10b981;
          font-size: 14px;
          margin-bottom: 16px;
          padding: 10px;
          background-color: #d1fae5;
          border-radius: 8px;
          text-align: center;
        }
      `}</style>

      {/* ════ PAGE WRAPPER ════ */}
      <div className="relative max-h-screen flex items-stretch overflow-hidden">
        {/* ════ LEFT PANEL (desktop only) ════ */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between
                     overflow-hidden bg-emerald-50 border border-white/30 rounded-md
                     p-10 xl:p-14"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

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

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <h1 className="font-cormorant text-green-800 text-[2.8rem] xl:text-[3.2rem] font-bold leading-[1.05] tracking-tight mb-4">
                Farm smarter,
                <br />
                <span className="text-green-600 tracking-wide">
                  not harder.
                </span>
              </h1>
              <p className="font-dm font-light text-emerald-500 text-[13.5px] leading-relaxed max-w-xs">
                AI-powered soil analysis, crop planning and yield forecasting —
                built for the modern farmer.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 flex justify-center my-6">
            <div className="w-72 xl:w-72 drop-shadow-[0_16px_32px_rgba(0,0,0,0.18)]">
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

        {/* ════ RIGHT PANEL — FORM ════ */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-8 overflow-scroll ">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[430px] 
                       bg-white rounded-[24px] p-8
                       border border-gray-100
                       shadow-[0_8px_40px_rgba(16,185,129,0.10)] mt-55"
          >
            <div className="flex flex-col items-center mb-6">
              <div
                className="lg:hidden w-11 h-11 rounded-[14px]
                              flex items-center justify-center
                              shadow-[0_4px_16px_rgba(22,163,74,0.28)] mb-4"
              >
                <img src="./logo-brows.png" alt="logo" className="w-8 h-8" />
              </div>
              <h2 className="font-cormorant text-[2.1rem] font-bold text-gray-800 leading-none tracking-tight">
                Create Account
              </h2>
              <p className="font-dm font-light text-gray-400 text-[11.5px] mt-1.5 tracking-widest uppercase">
                AgroIntel AI Platform
              </p>
            </div>

            {/* Success/Error Messages */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="mb-7">
              <Divider label="Sign Up" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  size={15}
                />
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="agro-field"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  size={15}
                />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleInputChange}
                  className="agro-field"
                />
              </div>

              {/* Phone Number */}
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  size={15}
                />
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                  className="agro-field"
                />
              </div>

              {/* Farmer Type */}
              <div className="relative">
                <Leaf
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  size={15}
                />
                <select
                  required
                  name="farmerType"
                  value={form.farmerType}
                  onChange={handleInputChange}
                  className="agro-select"
                >
                  <option value="Small Farmer">Small Farmer</option>
                  <option value="Medium Farmer">Medium Farmer</option>
                  <option value="Large Farmer">Large Farmer</option>
                  <option value="Contract Farmer">Contract Farmer</option>
                  <option value="Organic Farmer">Organic Farmer</option>
                  <option value="Dairy Farmer">Dairy Farmer</option>
                  <option value="Poultry Farmer">Poultry Farmer</option>
                  <option value="Fisherman">Fisherman</option>
                </select>
              </div>

              {/* Preferred Language */}
              <div className="relative">
                <Globe
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  size={15}
                />
                <select
                  name="language"
                  value={form.language}
                  onChange={handleInputChange}
                  className="agro-select"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  size={15}
                />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create Password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="agro-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-1.5 -mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          bar <= passwordStrength.level
                            ? passwordStrength.color
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10.5px] font-dm text-gray-400">
                    Password strength:{" "}
                    <span
                      className={`font-medium ${
                        passwordStrength.level <= 1
                          ? "text-red-500"
                          : passwordStrength.level <= 2
                            ? "text-orange-400"
                            : passwordStrength.level <= 3
                              ? "text-yellow-500"
                              : "text-green-600"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}

              {/* File Upload */}
              <FileUpload
                files={files}
                onAdd={addFiles}
                onRemove={removeFile}
              />

              {/* Submit Button with Loading State */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-[13px]
                           bg-gradient-to-r from-green-600 to-emerald-500
                           text-white font-dm font-medium text-[14px] tracking-wide
                           shadow-[0_4px_16px_rgba(22,163,74,0.25)]
                           transition-shadow duration-200 border-none cursor-pointer
                           ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </motion.button>
            </form>

            <div className="my-6">
              <Divider label="or continue with" />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.975 }}
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2.5 py-3
                         border border-gray-200 rounded-[13px] bg-white
                         font-dm font-medium text-[13.5px] text-gray-600
                         shadow-sm hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <FaGoogle className="text-red-500" size={14} />
              Sign up with Google
            </motion.button>

            <p className="text-center font-dm font-light text-[12.5px] text-gray-400 mt-5">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-green-600 font-medium hover:underline cursor-pointer transition-colors"
              >
                Log in
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
