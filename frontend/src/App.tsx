import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Employers from "./pages/Employers";
import Blog from "./pages/Blog";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";

// Company Admin
import { CompanyAdminAuthProvider, CompanyAdminLayout } from "./hooks/useCompanyAdminAuth";
import CompanyAdminLogin from "./pages/company-admin/CompanyAdminLogin";
import CompanyAdminDashboard from "./pages/company-admin/CompanyAdminDashboard";
import CompanyAdminCompanyPage from "./pages/company-admin/CompanyAdminCompanyPage";
import CompanyAdminJobs from "./pages/company-admin/CompanyAdminJobs";
import CompanyAdminApplications from "./pages/company-admin/CompanyAdminApplications";
import CompanyAdminCandidates from "./pages/company-admin/CompanyAdminCandidates";
import CompanyAdminInterviews from "./pages/company-admin/CompanyAdminInterviews";
import CompanyAdminTeam from "./pages/company-admin/CompanyAdminTeam";
import CompanyAdminAnalytics from "./pages/company-admin/CompanyAdminAnalytics";
import CompanyAdminNotifications from "./pages/company-admin/CompanyAdminNotifications";
import CompanyAdminSettings from "./pages/company-admin/CompanyAdminSettings";

// Authenticated layout & pages
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AuthResumeBuilder from "./pages/dashboard/AuthResumeBuilder";
import Connections from "./pages/dashboard/Connections";
import ExploreJobs from "./pages/dashboard/ExploreJobs";
import JobApplications from "./pages/dashboard/Applications";
import Services from "./pages/dashboard/Services";
import Invite from "./pages/dashboard/Invite";
import Profile from "./pages/dashboard/Profile";
import Matches from "./pages/dashboard/Matches";

// Admin
import { AdminAuthProvider } from "./hooks/useAdminAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboard";
import AdminJobSeekers from "./pages/admin/JobSeekers";
import AdminCompanyAdmins from "./pages/admin/CompanyAdmins";
import AdminCompanies from "./pages/admin/Companies";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import AdminJobFeeds from "./pages/admin/JobFeeds";
import AdminJobFeedSyncHistory from "./pages/admin/JobFeedSyncHistory";
import AdminJobFeedFailedJobs from "./pages/admin/JobFeedFailedJobs";
import AdminCategories from "./pages/admin/Categories";
import AdminSkills from "./pages/admin/Skills";
import AdminReports from "./pages/admin/Reports";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSecurity from "./pages/admin/Security";
import AdminAuditLogs from "./pages/admin/AuditLogs";
import AdminNotifications from "./pages/admin/Notifications";
import AdminATSSettings from "./pages/admin/ATSSettings";
import AdminPlatformSettings from "./pages/admin/PlatformSettings";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/" element={<Home />} />
      <Route path="/employers" element={<Employers />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/jobs" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/company/register" element={<CompanyRegisterPage />} />

      {/* ── Company Admin Routes ── */}
      <Route path="/company-admin" element={<CompanyAdminAuthProvider />}>
        <Route path="login" element={<CompanyAdminLogin />} />
        <Route element={<CompanyAdminLayout />}>
          <Route path="dashboard" element={<CompanyAdminDashboard />} />
          <Route path="company-page" element={<CompanyAdminCompanyPage />} />
          <Route path="jobs" element={<CompanyAdminJobs />} />
          <Route path="applications" element={<CompanyAdminApplications />} />
          <Route path="candidates" element={<CompanyAdminCandidates />} />
          <Route path="interviews" element={<CompanyAdminInterviews />} />
          <Route path="team" element={<CompanyAdminTeam />} />
          <Route path="analytics" element={<CompanyAdminAnalytics />} />
          <Route path="notifications" element={<CompanyAdminNotifications />} />
          <Route path="settings" element={<CompanyAdminSettings />} />
        </Route>
      </Route>

      {/* ── Authenticated Routes ── */}
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<DashboardHome />} />
        <Route path="/resume-builder" element={<ErrorBoundary><AuthResumeBuilder /></ErrorBoundary>} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/explore-jobs" element={<ExploreJobs />} />
        <Route path="/applications" element={<JobApplications />} />
        <Route path="/services" element={<Services />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
      </Route>

      {/* ── Admin Routes ── */}
      {/* AdminAuthProvider is a layout route — it wraps ALL admin routes with a single context */}
      <Route path="/admin" element={<AdminAuthProvider />}>
        <Route index element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="job-seekers" element={<AdminJobSeekers />} />
          <Route path="company-admins" element={<AdminCompanyAdmins />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="job-feeds" element={<AdminJobFeeds />} />
          <Route path="job-feeds/sync-history" element={<AdminJobFeedSyncHistory />} />
          <Route path="job-feeds/failed-jobs" element={<AdminJobFeedFailedJobs />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="ats-settings" element={<AdminATSSettings />} />
          <Route path="settings" element={<AdminPlatformSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
