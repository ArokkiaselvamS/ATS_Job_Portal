import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Employers from "./pages/Employers";
import Blog from "./pages/Blog";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

// Authenticated layout & pages
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AuthResumeBuilder from "./pages/dashboard/AuthResumeBuilder";
import Connections from "./pages/dashboard/Connections";
import ExploreJobs from "./pages/dashboard/ExploreJobs";
import Applications from "./pages/dashboard/Applications";
import Services from "./pages/dashboard/Services";
import Invite from "./pages/dashboard/Invite";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a minimal loader while we check auth state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Public / Unauthenticated Routes ── */}
      <Route path="/" element={<Home />} />
      <Route path="/employers" element={<Employers />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/jobs" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Authenticated Routes ── */}
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<DashboardHome />} />
        <Route path="/resume-builder" element={isAuthenticated ? <AuthResumeBuilder /> : <Home />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/explore-jobs" element={<ExploreJobs />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/services" element={<Services />} />
        <Route path="/invite" element={<Invite />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}