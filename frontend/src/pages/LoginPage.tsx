import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle, sendPasswordReset } from "../services/firebaseAuth";
import HeroSection from "../../../aescion-login/src/components/HeroSection.jsx";
import LoginForm from "../../../aescion-login/src/components/LoginForm.jsx";
import ForgotPasswordModal from "../../../aescion-login/src/components/ForgotPasswordModal.jsx";
import Toast from "../../../aescion-login/src/components/Toast.jsx";
import "../styles/auth-scoped.css";

function getRedirectPath(role: string): string {
  switch (role) {
    case 'COMPANY_ADMIN':
      return '/company-admin/dashboard';
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin/dashboard';
    case 'JOB_SEEKER':
    default:
      return '/home';
  }
}

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
              onGoogleLogin={signInWithGoogle}
              onLoginSuccess={(userData: any) => {
                login(userData);
                const redirectPath = getRedirectPath(userData.role);
                navigate(redirectPath);
              }}
            />
          </AnimatePresence>
        </motion.div>

        <ForgotPasswordModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onSendResetEmail={sendPasswordReset}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
