import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const LOTTIE_URLS = {
  hero: "/lottie/plant.json",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Divider = ({ label }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />
    <span className="text-[10.5px] font-dm uppercase tracking-[0.2em] text-gray-400 shrink-0">
      {label}
    </span>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />
  </div>
);

const ForgotPassword = () => {
  const [step, setStep] = useState("EMAIL"); // EMAIL | OTP | RESET | SUCCESS
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lottieData, setLottieData] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch(LOTTIE_URLS.hero)
      .then((r) => r.json())
      .then(setLottieData)
      .catch(() => setLottieData(null));
  }, []);

  axios.defaults.withCredentials = true;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/forgot-password/send-otp`, { email });
      setSuccess(data.message || "OTP sent to your email");
      setStep("OTP");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/forgot-password/verify-otp`, { email, otp });
      setResetToken(data.resetToken);
      setSuccess("OTP verified! Set your new password.");
      setStep("RESET");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setSuccess("");
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/forgot-password/reset`, {
        email,
        resetToken,
        newPassword,
      });
      setSuccess(data.message || "Password reset successfully!");
      setStep("SUCCESS");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = {
    EMAIL: "Reset Password",
    OTP: "Verification",
    RESET: "New Password",
    SUCCESS: "Done",
  };

  const stepSubtext = {
    EMAIL: "Enter your email to receive a verification code",
    OTP: `Enter the 6-digit code sent to ${email}`,
    RESET: "Choose a new password for your account",
    SUCCESS: "Your password has been reset",
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

      <div className="relative min-h-screen flex items-stretch overflow-hidden">
        {/* LEFT PANEL */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[400px] bg-white rounded-[24px] p-5
                       border border-gray-100
                       shadow-[0_8px_40px_rgba(16,185,129,0.10)]"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="flex flex-col items-center mb-7"
            >
              <div className="lg:hidden w-11 h-11 rounded-[14px] flex items-center justify-center shadow-[0_4px_16px_rgba(22,163,74,0.25)] mb-4">
                <img src="./logo-brows.png" alt="logo" className="w-8 h-8" />
              </div>
              <h2 className="font-cormorant text-[2.1rem] font-bold text-gray-800 leading-none tracking-tight">
                {step === "SUCCESS" ? "All Done!" : "Forgot Password"}
              </h2>
              <p className="font-dm font-light text-gray-400 text-[11.5px] mt-1.5 tracking-widest uppercase text-center">
                {stepSubtext[step]}
              </p>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="success-message">
                {success}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-7">
              <Divider label={stepLabel[step]} />
            </motion.div>

            {/* EMAIL STEP */}
            {step === "EMAIL" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32, duration: 0.45 }}
                  className="relative"
                >
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="agro-field"
                    disabled={loading}
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
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
                  {loading ? "Sending OTP..." : "Send OTP"}
                </motion.button>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.46 }} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-dm text-[12px] text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={13} /> Back to Login
                  </button>
                </motion.div>
              </form>
            )}

            {/* OTP STEP */}
            {step === "OTP" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 md:mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32, duration: 0.45 }}
                >
                  <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
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
                  <p className="text-[10px] text-gray-400 mt-2 text-center">OTP expires in 5 minutes</p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: loading ? 1 : 0.975 }}
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={`w-full py-3 rounded-[13px]
                    bg-gradient-to-r from-green-600 to-emerald-500
                    text-white font-dm font-medium text-[14px] tracking-wide
                    shadow-[0_4px_16px_rgba(22,163,74,0.25)]
                    transition-shadow duration-200 border-none cursor-pointer
                    ${loading || otp.length !== 6 ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.46 }} className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setStep("EMAIL"); setOtp(""); setError(""); setSuccess(""); }}
                    className="font-dm text-[12px] text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1"
                    disabled={loading}
                  >
                    <ArrowLeft size={13} /> Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="font-dm text-[12px] text-green-600 hover:underline transition-colors"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </motion.div>
              </form>
            )}

            {/* RESET STEP */}
            {step === "RESET" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32, duration: 0.45 }}
                  className="relative"
                >
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                  <input
                    required
                    type={showNew ? "text" : "password"}
                    placeholder="New Password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="agro-field pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38, duration: 0.45 }}
                  className="relative"
                >
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                  <input
                    required
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="agro-field"
                    disabled={loading}
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
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
                  {loading ? "Resetting..." : "Reset Password"}
                </motion.button>
              </form>
            )}

            {/* SUCCESS STEP */}
            {step === "SUCCESS" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <p className="font-dm text-sm text-gray-600 mb-6">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-[13px]
                    bg-gradient-to-r from-green-600 to-emerald-500
                    text-white font-dm font-medium text-[14px] tracking-wide
                    shadow-[0_4px_16px_rgba(22,163,74,0.25)]
                    transition-shadow duration-200 border-none cursor-pointer"
                >
                  Go to Login
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
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
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-12"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <img src="./logo-brows.png" alt="logo" className="w-7 h-7" />
              </div>
              <span className="font-cormorant text-xl font-semibold text-emerald-800 tracking-tight">
                AgroIntel
              </span>
            </motion.div>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center">
            {lottieData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="w-full max-w-[320px]"
              >
                <Lottie animationData={lottieData} loop />
              </motion.div>
            )}
          </div>

          <div className="relative z-10 mt-12">
            <motion.blockquote
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="border-l-2 border-emerald-300/50 pl-4"
            >
              <p className="font-dm text-[13px] text-emerald-700/80 italic leading-relaxed">
                "Secure your account, secure your harvest."
              </p>
              <cite className="block font-dm text-[10px] text-emerald-600/50 mt-2 uppercase tracking-[0.15em] not-italic">
                — AgroIntel Security
              </cite>
            </motion.blockquote>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
