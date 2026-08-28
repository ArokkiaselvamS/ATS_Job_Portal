import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, X, ArrowRight, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import './OtpVerificationModal.css'

export default function OtpVerificationModal({ 
  open, 
  email, 
  phone,
  onClose, 
  onVerifySuccess,
  onNotify 
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const [isSuccess, setIsSuccess] = useState(false)
  const inputsRef = useRef([])

  // Reset and focus when modal opens
  useEffect(() => {
    if (open) {
      setDigits(['', '', '', '', '', ''])
      setError('')
      setIsSuccess(false)
      setCooldown(60)
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus()
        }
      }, 150)
    }
  }, [open])

  // Countdown timer for resend
  useEffect(() => {
    if (!open || cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [open, cooldown])

  // Handle individual digit input
  function handleChange(index, value) {
    const cleanVal = value.replace(/[^0-9]/g, '')
    if (!cleanVal) {
      const newDigits = [...digits]
      newDigits[index] = ''
      setDigits(newDigits)
      return
    }

    const lastChar = cleanVal.slice(-1)
    const newDigits = [...digits]
    newDigits[index] = lastChar
    setDigits(newDigits)
    setError('')

    // Move to next input if available
    if (index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  // Handle Backspace and arrow keys
  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  // Handle paste of 6-digit code
  function handlePaste(e) {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pastedData) return

    const newDigits = ['', '', '', '', '', '']
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i]
    }
    setDigits(newDigits)
    setError('')

    const nextFocusIndex = Math.min(pastedData.length, 5)
    inputsRef.current[nextFocusIndex]?.focus()

    // If full 6 digits pasted, trigger submit
    if (pastedData.length === 6) {
      submitOtp(newDigits.join(''))
    }
  }

  // Resend OTP handler
  async function handleResend() {
    if (cooldown > 0 || resending) return
    setResending(true)
    setError('')

    try {
      const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api'
      const res = await fetch(`${apiBase}/auth/resend-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setCooldown(60)
        if (onNotify) onNotify('A new 6-digit verification code has been sent!', 'success')
      } else {
        setError(data.message || 'Failed to resend code.')
      }
    } catch {
      setError('Unable to reach server to resend code.')
    } finally {
      setResending(false)
    }
  }

  // Submit and verify OTP
  async function submitOtp(codeToVerify) {
    const otpCode = codeToVerify || digits.join('')
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api'
      const res = await fetch(`${apiBase}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otpCode }),
      })
      const data = await res.json()

      if (data.success) {
        setIsSuccess(true)
        if (onNotify) onNotify('Email verified successfully! Welcome to AESCION.', 'success')
        setTimeout(() => {
          if (onVerifySuccess) onVerifySuccess(data.data)
        }, 1200)
      } else {
        setError(data.message || 'Invalid verification code. Please check and try again.')
      }
    } catch {
      setError('Unable to connect to the verification server.')
    } finally {
      setLoading(false)
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    submitOtp()
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
            if (e.target === e.currentTarget && !loading && !isSuccess) onClose()
          }}
        >
          <motion.div
            className="otp-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-title"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {!loading && !isSuccess && (
              <button 
                type="button" 
                className="otp-modal__close-btn" 
                onClick={onClose} 
                aria-label="Close"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            )}

            {!isSuccess ? (
              <>
                <div className="otp-modal__icon-wrap">
                  <ShieldCheck size={30} strokeWidth={2.2} />
                </div>

                <h2 id="otp-title" className="otp-modal__title">
                  Verify Your Account
                </h2>

                <p className="otp-modal__subtitle">
                  We've sent a 6-digit verification code to<br />
                  <span className="otp-modal__email-badge">{email}</span>
                  {phone ? <> &amp; <span className="otp-modal__email-badge">{phone}</span></> : null}
                </p>

                <form onSubmit={handleFormSubmit}>
                  <div className="otp-inputs-grid" onPaste={handlePaste}>
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        className={`otp-box-input ${digit ? 'has-value' : ''} ${error ? 'is-error' : ''}`}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        disabled={loading}
                        aria-label={`Digit ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.div 
                      className="otp-modal__error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="otp-modal__resend-row">
                    <span>Didn't receive the code?</span>
                    <button
                      type="button"
                      className="otp-modal__resend-btn"
                      onClick={handleResend}
                      disabled={cooldown > 0 || resending || loading}
                    >
                      {resending ? (
                        'Sending...'
                      ) : cooldown > 0 ? (
                        `Resend in ${cooldown}s`
                      ) : (
                        'Resend OTP'
                      )}
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    className="otp-modal__submit"
                    disabled={loading || digits.join('').length < 6}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    {loading ? (
                      <span className="modal-panel__spinner" aria-hidden="true" />
                    ) : (
                      <>
                        <span>Verify & Complete Registration</span>
                        <ArrowRight size={17} strokeWidth={2.4} />
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '20px 0' }}
              >
                <div 
                  className="otp-modal__icon-wrap" 
                  style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: '#16a34a', margin: '0 auto 18px' }}
                >
                  <CheckCircle2 size={32} strokeWidth={2.4} />
                </div>
                <h2 className="otp-modal__title" style={{ color: '#16a34a' }}>Email Verified!</h2>
                <p className="otp-modal__subtitle" style={{ marginBottom: 0 }}>
                  Your account is activated. Redirecting you to your dashboard...
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
