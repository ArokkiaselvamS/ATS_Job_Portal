import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Mail, X, CheckCircle2, ArrowRight } from 'lucide-react'
import './ForgotPasswordModal.css'

export default function ForgotPasswordModal({ open, onClose, onSendResetEmail }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setEmail('')
        setError('')
        setSent(false)
        setSending(false)
      }, 250)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setSending(true)

    try {
      if (onSendResetEmail) {
        await onSendResetEmail(email)
      } else {
        await new Promise((r) => setTimeout(r, 800))
      }
      setSent(true)
    } catch (err) {
      if (err?.code === 'auth/user-not-found') {
        setSent(true)
      } else {
        setError(err?.message || 'Failed to send password reset email.')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <button type="button" className="modal-panel__close" onClick={onClose} aria-label="Close dialog">
              <X size={18} strokeWidth={2.2} />
            </button>

            {!sent ? (
              <>
                <span className="modal-panel__icon">
                  <Lock size={22} strokeWidth={2.2} />
                </span>
                <h2 id="forgot-password-title" className="modal-panel__title">
                  Reset your password
                </h2>
                <p className="modal-panel__subtitle">
                  Enter the email linked to your account and we'll send a secure reset link.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className={`modal-panel__field ${error ? 'has-error' : ''}`}>
                    <Mail size={17} strokeWidth={2} />
                    <input
                      type="email"
                      value={email}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-label="Email address"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="modal-panel__error" role="alert">{error}</p>}

                  <motion.button
                    type="submit"
                    className="modal-panel__submit"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={sending}
                  >
                    {sending ? (
                      <span className="modal-panel__spinner" aria-hidden="true" />
                    ) : (
                      <>
                        Send reset link <ArrowRight size={16} strokeWidth={2.4} />
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div
                className="modal-panel__success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="modal-panel__icon modal-panel__icon--success">
                  <CheckCircle2 size={24} strokeWidth={2.2} />
                </span>
                <h2 className="modal-panel__title">Check your inbox</h2>
                <p className="modal-panel__subtitle">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way.
                </p>
                <button type="button" className="modal-panel__submit modal-panel__submit--ghost" onClick={onClose}>
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
