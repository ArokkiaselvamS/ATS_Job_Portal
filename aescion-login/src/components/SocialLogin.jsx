import { useState } from 'react'
import { motion } from 'framer-motion'
import './SocialLogin.css'

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.6z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.04l2.97-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.96l2.97 2.34C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  )
}

function MicrosoftMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true">
      <rect x="0" y="0" width="8" height="8" fill="#F35325" />
      <rect x="9" y="0" width="8" height="8" fill="#81BC06" />
      <rect x="0" y="9" width="8" height="8" fill="#05A6F0" />
      <rect x="9" y="9" width="8" height="8" fill="#FFBA08" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
      <path
        fill="#111"
        d="M13.1 9.53c-.02-2.13 1.74-3.15 1.82-3.2-1-1.46-2.55-1.66-3.1-1.68-1.32-.13-2.58.78-3.25.78-.68 0-1.7-.76-2.8-.74-1.44.02-2.77.84-3.51 2.13-1.5 2.6-.38 6.44 1.08 8.55.71 1.04 1.56 2.2 2.68 2.16 1.08-.04 1.49-.7 2.8-.7 1.3 0 1.68.7 2.82.68 1.16-.02 1.9-1.05 2.6-2.1a9.1 9.1 0 0 0 1.18-2.4 4 4 0 0 1-2.32-3.48z"
      />
      <path
        fill="#111"
        d="M11.1 2.9c.58-.71.98-1.68.87-2.65-.84.03-1.86.56-2.46 1.26-.54.62-1.02 1.62-.89 2.57.93.07 1.88-.47 2.48-1.18z"
      />
    </svg>
  )
}

const PROVIDERS = [
  { id: 'google', label: 'Google', Icon: GoogleMark },
  { id: 'microsoft', label: 'Microsoft', Icon: MicrosoftMark },
  { id: 'apple', label: 'Apple', Icon: AppleMark },
]

export default function SocialLogin({ onSelect, onLoginSuccess, onNotify, onGoogleLogin }) {
  const [loadingProvider, setLoadingProvider] = useState(null)

  async function handleClick(providerId, label) {
    if (providerId === 'google' && onGoogleLogin) {
      try {
        setLoadingProvider('google')
        if (onNotify) onNotify('Signing in with Google...', 'info')
        const userData = await onGoogleLogin()
        if (onNotify) onNotify(`Signed in as ${userData.firstName}!`, 'success')
        if (onLoginSuccess) onLoginSuccess(userData)
      } catch (err) {
        if (err?.code !== 'auth/popup-closed-by-user') {
          if (onNotify) onNotify(err?.message || 'Google sign-in failed.', 'error')
        }
      } finally {
        setLoadingProvider(null)
      }
    } else {
      if (onSelect) onSelect(label)
    }
  }

  return (
    <div className="social-login">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <motion.button
          key={id}
          type="button"
          className="social-login__btn"
          disabled={loadingProvider !== null}
          whileHover={{ y: -3, boxShadow: '0 10px 22px rgba(28,36,64,0.1)' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleClick(id, label)}
        >
          <Icon />
          <span>{loadingProvider === id ? 'Signing in...' : label}</span>
        </motion.button>
      ))}
    </div>
  )
}
