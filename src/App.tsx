import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ApplicationTracker from "./pages/ApplicationTracker";
import ResumeBuilder from "./pages/ResumeBuilder";
import Employers from "./pages/Employers";
import Blog from "./pages/Blog";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/application-tracker" element={<ApplicationTracker />} />
      <Route path="/resume-builder" element={<ResumeBuilder />} />
      <Route path="/employers" element={<Employers />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/jobs" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}