import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroSection from './components/HeroSection.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import LoginForm from './components/LoginForm.jsx'
import ForgotPasswordModal from './components/ForgotPasswordModal.jsx'
import Toast from './components/Toast.jsx'
import './App.css'

export default function App() {
  const [authMode, setAuthMode] = useState('register') // 'register' or 'login'
  const [language, setLanguage] = useState('en')
  const [modalOpen, setModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message, variant = 'info') => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <div className="app-shell">
      <motion.div
        className="app-card"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <HeroSection />

        <AnimatePresence mode="wait">
          {authMode === 'register' ? (
            <RegisterForm
              key="register-form"
              language={language}
              onLanguageChange={setLanguage}
              onSwitchToLogin={() => setAuthMode('login')}
              onNotify={notify}
            />
          ) : (
            <LoginForm
              key="login-form"
              language={language}
              onLanguageChange={setLanguage}
              onOpenForgotPassword={() => setModalOpen(true)}
              onSwitchToRegister={() => setAuthMode('register')}
              onNotify={notify}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <ForgotPasswordModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

