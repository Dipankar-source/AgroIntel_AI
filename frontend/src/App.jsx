import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import HowToUse from "./pages/auth/HowToUse";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SoilAnalysis from "./pages/SoilAnalysis";
import CropPlanner from "./pages/CropPlanner";
import Market from "./pages/Market";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import AiInsights from "./pages/AiInsights";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import WatchDemo from "./pages/WatchDemo";
import Subscription from "./pages/Subscription";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";

const AppContent = () => {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/how-to-use" ||
    location.pathname === "/forgot-password";

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/soil"
          element={
            <ProtectedRoute>
              <SoilAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <CropPlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/market"
          element={
            <ProtectedRoute>
              <Market />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <AiInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demo"
          element={
              <WatchDemo />
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
