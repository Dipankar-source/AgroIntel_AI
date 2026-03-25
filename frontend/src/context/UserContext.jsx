// frontend/src/context/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Create Context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Load user from token on initial mount
  useEffect(() => {
    loadUser();
  }, []);

  // Load user function - verifies token and gets user data
  const loadUser = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get user data from localStorage first (faster)
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);

        // Verify token with backend (optional - uncomment if you want to validate on every load)
        // await verifyToken();
      } else {
        // If no stored data, try to get from cookie via backend
        await fetchUserFromCookie();
      }
    } catch (err) {
      console.error("Error loading user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Verify token with backend
  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/verify`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      logout();
      return false;
    }
  };

  // Fetch user from cookie (for when localStorage is empty but cookie exists)
  const fetchUserFromCookie = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        console.log("User loaded from cookie:", response.data.user);
      }
    } catch (err) {
      // No user logged in via cookie, that's fine
      console.log("No user found in cookie");
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      console.log("Login response:", response.data);

      if (response.data.step === "OTP_VERIFICATION") {
        // OTP verification needed
        return {
          success: false,
          requiresOTP: true,
          email: response.data.email || email,
          message: response.data.msg,
        };
      } else if (response.data.success) {
        // Direct login successful
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || "Login failed");
      return {
        success: false,
        error: err.response?.data?.msg || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (email, otp) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/verify-otp`,
        { email, otp },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      console.log("OTP verification response:", response.data);

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);
          // Required: log user data on browser console after OTP verification
          console.log("✅ Logged-in user:", response.data.user);
        }
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: "OTP verification failed" };
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.msg || "OTP verification failed");
      return {
        success: false,
        error: err.response?.data?.msg || "OTP verification failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const resendOTP = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.data.step === "OTP_VERIFICATION") {
        return { success: true, message: "New OTP sent to your email!" };
      } else {
        return { success: false, error: "Failed to resend OTP" };
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.response?.data?.msg || "Failed to resend OTP");
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to resend OTP",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint to clear cookie
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear local storage and state regardless
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  // Delete account permanently
  const deleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/api/user/account`, {
        withCredentials: true,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
      return { success: true };
    } catch (err) {
      console.error("Delete account error:", err);
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to delete account",
      };
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        userData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
    } catch (err) {
      console.error("Update user error:", err);
      setError(err.response?.data?.msg || "Failed to update profile");
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to update profile",
      };
    }
  };

  // Refresh user data from backend (useful after payment or other updates)
  const refreshUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (err) {
      console.error("Refresh user error:", err);
      return {
        success: false,
        error: err.response?.data?.msg || "Failed to refresh user data",
      };
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === "admin";
  };

  const setUserFromApi = (nextUser) => {
    if (!nextUser) return;
    setUser(nextUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } catch {
      // ignore storage errors
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    verifyOTP,
    resendOTP,
    logout,
    deleteAccount,
    updateUser,
    refreshUser,
    loadUser,
    hasRole,
    isAdmin,
    setUserFromApi,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
