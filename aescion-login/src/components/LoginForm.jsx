import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import LanguageSelector from './LanguageSelector.jsx'
import InputField from './InputField.jsx'
import SocialLogin from './SocialLogin.jsx'
import SecurityCard from './SecurityCard.jsx'
import './LoginForm.css'

const REMEMBER_KEY = 'aescion.rememberMe'

const COPY = {
  en: {
    welcome: 'Welcome Back! 👋',
    loginAccent: 'Login',
    loginRest: 'to your account',
    email: 'Email or Username',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot Password?',
    submit: 'Login',
    or: 'or continue with',
    noAccount: "Don't have an account?",
    registerLink: 'Register',
  },
  ta: {
    welcome: 'மீண்டும் வரவேற்கிறோம்! 👋',
    loginAccent: 'உள்நுழை',
    loginRest: 'உங்கள் கணக்கிற்கு',
    email: 'மின்னஞ்சல் / பயனர்பெயர்',
    password: 'கடவுச்சொல்',
    remember: 'என்னை நினைவில் கொள்க',
    forgot: 'கடவுச்சொல் மறந்துவிட்டதா?',
    submit: 'உள்நுழை',
    or: 'அல்லது இதன் மூலம் தொடரவும்',
    noAccount: 'கணக்கு இல்லையா?',
    registerLink: 'பதிவு செய்க',
  },
  hi: {
    welcome: 'वापसी पर स्वागत है! 👋',
    loginAccent: 'लॉगिन',
    loginRest: 'अपने खाते में',
    email: 'ईमेल या यूज़रनेम',
    password: 'पासवर्ड',
    remember: 'मुझे याद रखें',
    forgot: 'पासवर्ड भूल गए?',
    submit: 'लॉगिन',
    or: 'या इसके साथ जारी रखें',
    noAccount: 'खाता नहीं है?',
    registerLink: 'रजिस्टर करें',
  },
}

const initialValues = { identifier: '', password: '' }

function validate(values, t) {
  const errors = {}

  if (!values.identifier.trim()) {
    errors.identifier = `${t.email} is required.`
  } else if (values.identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.identifier)) {
    errors.identifier = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

export default function LoginForm({ language, onLanguageChange, onOpenForgotPassword, onSwitchToRegister, onNotify }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [rememberMe, setRememberMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const t = COPY[language] ?? COPY.en

  useEffect(() => {
    const stored = window.localStorage.getItem(REMEMBER_KEY)
    setRememberMe(stored === 'true')
  }, [])

  function updateField(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
    if (touched[field]) {
      const nextVals = { ...values, [field]: value }
      const newErrors = validate(nextVals, t)
      setErrors((e) => ({ ...e, [field]: newErrors[field] }))
    }
  }

  function handleBlur(field) {
    setTouched((tt) => ({ ...tt, [field]: true }))
    const newErrors = validate(values, t)
    setErrors((e) => ({ ...e, [field]: newErrors[field] }))
  }

  function toggleRememberMe() {
    const next = !rememberMe
    setRememberMe(next)
    window.localStorage.setItem(REMEMBER_KEY, String(next))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(values, t)
    setErrors(validationErrors)
    setTouched({ identifier: true, password: true })

    if (Object.keys(validationErrors).length > 0) {
      onNotify('Please enter your login details.', 'info')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onNotify(`Welcome back, ${values.identifier.split('@')[0]}!`, 'success')
    }, 1200)
  }

  return (
    <motion.section
      key="login"
      className="login-form"
      aria-label="Login"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="login-form__topbar">
        <LanguageSelector language={language} onChange={onLanguageChange} />
      </div>

      <div className="login-form__header">
        <p className="login-form__welcome">{t.welcome}</p>
        <h2 className="login-form__title">
          <span className="login-form__title-accent">{t.loginAccent}</span> {t.loginRest}
        </h2>
      </div>

      <form className="login-form__fields" onSubmit={handleSubmit} noValidate>
        <InputField
          label={t.email}
          icon={Mail}
          type="text"
          autoComplete="username"
          placeholder={t.email}
          value={values.identifier}
          error={touched.identifier ? errors.identifier : undefined}
          onChange={(val) => updateField('identifier', val)}
          onBlur={() => handleBlur('identifier')}
        />

        <InputField
          label={t.password}
          icon={Lock}
          isPassword
          autoComplete="current-password"
          placeholder={t.password}
          value={values.password}
          error={touched.password ? errors.password : undefined}
          onChange={(val) => updateField('password', val)}
          onBlur={() => handleBlur('password')}
        />

        <div className="login-form__row">
          <label className="login-form__checkbox">
            <input type="checkbox" checked={rememberMe} onChange={toggleRememberMe} />
            <span className="login-form__checkbox-box" aria-hidden="true" />
            <span>{t.remember}</span>
          </label>
          <button type="button" className="login-form__forgot" onClick={onOpenForgotPassword}>
            {t.forgot}
          </button>
        </div>

        <motion.button
          type="submit"
          className="login-form__submit"
          disabled={submitting}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="login-form__submit-shine" aria-hidden="true" />
          {submitting ? (
            <span className="login-form__spinner" aria-hidden="true" />
          ) : (
            <>
              <span>{t.submit}</span>
              <ArrowRight size={18} strokeWidth={2.4} />
            </>
          )}
        </motion.button>
      </form>

      <div className="login-form__switch-row">
        <p>{t.noAccount}</p>
        <button type="button" className="login-form__switch-btn" onClick={onSwitchToRegister}>
          {t.registerLink}
        </button>
      </div>

      <div className="login-form__divider">
        <span />
        <p>{t.or}</p>
        <span />
      </div>

      <SocialLogin onSelect={(provider) => onNotify(`${provider} sign-in integration is ready.`, 'info')} />

      <div className="login-form__security">
        <SecurityCard />
      </div>
    </motion.section>
  )
}


