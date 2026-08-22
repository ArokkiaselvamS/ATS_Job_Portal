import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X } from 'lucide-react'
import './Toast.css'

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast--${toast.variant ?? 'info'}`}
            initial={{ opacity: 0, y: 40, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <span className="toast__icon">
              {toast.variant === 'success' ? (
                <CheckCircle2 size={18} strokeWidth={2.2} />
              ) : (
                <Info size={18} strokeWidth={2.2} />
              )}
            </span>
            <p className="toast__message">{toast.message}</p>
            <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
              <X size={14} strokeWidth={2.4} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
