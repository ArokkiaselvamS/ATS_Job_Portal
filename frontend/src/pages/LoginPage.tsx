import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeroSection from "../../../aescion-login/src/components/HeroSection.jsx";
import LoginForm from "../../../aescion-login/src/components/LoginForm.jsx";
import ForgotPasswordModal from "../../../aescion-login/src/components/ForgotPasswordModal.jsx";
import Toast from "../../../aescion-login/src/components/Toast.jsx";
import "../styles/auth-scoped.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [language, setLanguage] = useState("en");
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  const notify = useCallback((message: string, variant = "info") => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="auth-page">
      <div className="app-shell">
        <motion.div
          className="app-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <HeroSection />

          <AnimatePresence mode="wait">
            <LoginForm
              key="login-form"
              language={language}
              onLanguageChange={setLanguage}
              onOpenForgotPassword={() => setModalOpen(true)}
              onSwitchToRegister={() => navigate("/register")}
              onNotify={notify}
              onLoginSuccess={(userData: any) => {
                login(userData);
                navigate("/home");
              }}
            />
          </AnimatePresence>
        </motion.div>

        <ForgotPasswordModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
