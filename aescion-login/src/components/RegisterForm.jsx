import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Lock, ArrowRight } from 'lucide-react'
import LanguageSelector from './LanguageSelector.jsx'
import InputField from './InputField.jsx'
import SocialLogin from './SocialLogin.jsx'
import SecurityCard from './SecurityCard.jsx'
import './LoginForm.css'

const REMEMBER_KEY = 'aescion.agreeTerms'

const COPY = {
  en: {
    welcome: 'Welcome! 👋',
    registerAccent: 'Create',
    registerRest: 'your account',
    slogan: 'Connect with opportunities and grow with AESCION',
    fullName: 'Full Name',
    mobile: 'Mobile Number',
    email: 'Email',
    password: 'Password',
    agree: 'I agree to the Terms & Privacy Policy',
    already: 'Already have an account?',
    loginLink: 'Log In',
    submit: 'Create Account',
    or: 'or continue with',
  },
  ta: {
    welcome: 'வரவேற்கிறோம்! 👋',
    registerAccent: 'உருவாக்குக',
    registerRest: 'உங்கள் கணக்கு',
    slogan: 'வாய்ப்புகளுடன் இணைந்து AESCION உடன் வளருங்கள்',
    fullName: 'முழு பெயர்',
    mobile: 'மொபைல் எண்',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    agree: 'விதிமுறைகளை ஏற்கிறேன்',
    already: 'ஏற்கனவே கணக்கு உள்ளதா?',
    loginLink: 'உள்நுழைக',
    submit: 'கணக்கை உருவாக்கு',
    or: 'அல்லது இதன் மூலம் தொடரவும்',
  },
  hi: {
    welcome: 'स्वागत है! 👋',
    registerAccent: 'बनाएं',
    registerRest: 'अपना खाता',
    slogan: 'अवसरों से जुड़ें और AESCION के साथ आगे बढ़ें',
    fullName: 'पूरा नाम',
    mobile: 'मोबाइल नंबर',
    email: 'ईमेल या यूज़रनेम',
    password: 'पासवर्ड',
    agree: 'नियम और शर्तें स्वीकार हैं',
    already: 'पहले से खाता है?',
    loginLink: 'लॉगिन करें',
    submit: 'खाता बनाएं',
    or: 'या इसके साथ जारी रखें',
  },
}

const initialValues = { fullName: '', mobile: '', identifier: '', password: '' }

function validate(values, t) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = `${t.fullName} is required.`
  }

  if (!values.mobile.trim()) {
    errors.mobile = `${t.mobile} is required.`
  } else if (!/^\+?[0-9]{10,14}$/.test(values.mobile.replace(/[\s-]/g, ''))) {
    errors.mobile = 'Enter a valid mobile number.'
  }

  if (!values.identifier.trim()) {
    errors.identifier = `${t.email} is required.`
  } else if (values.identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.identifier)) {
    errors.identifier = 'Enter a valid email address.'
  } else if (!values.identifier.includes('@') && values.identifier.trim().length < 3) {
    errors.identifier = 'Username must be at least 3 characters.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

export default function RegisterForm({ language, onLanguageChange, onSwitchToLogin, onNotify, onRegisterSuccess, onGoogleLogin, onRequireOtp }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [agree, setAgree] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const t = COPY[language] ?? COPY.en

  useEffect(() => {
    const stored = window.localStorage.getItem(REMEMBER_KEY)
    if (stored !== null) setAgree(stored === 'true')
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

  function toggleAgree() {
    const next = !agree
    setAgree(next)
    window.localStorage.setItem(REMEMBER_KEY, String(next))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(values, t)
    setErrors(validationErrors)
    setTouched({ fullName: true, mobile: true, identifier: true, password: true })

    if (Object.keys(validationErrors).length > 0) {
      onNotify('Please fill in the required fields.', 'info')
      return
    }

    const nameParts = values.fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || firstName
    const email = values.identifier.trim()

    setSubmitting(true)
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const res = await fetch(`${apiBase}/auth/send-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password: values.password,
          phone: values.mobile,
        }),
      })
      const data = await res.json()
      if (data.success) {
        onNotify(`Verification code sent to ${email}`, 'success')
        if (onRequireOtp) {
          onRequireOtp(email, values.mobile)
        }
      } else {
        onNotify(data.message || 'Unable to send verification OTP.', 'error')
      }
    } catch {
      onNotify('Unable to connect to the server. Please check your connection.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.section
      key="register"
      className="login-form"
      aria-label="Register"
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
          <span className="login-form__title-accent">{t.registerAccent}</span> {t.registerRest}
        </h2>
        <p className="login-form__slogan">{t.slogan}</p>
      </div>

      <form className="login-form__fields" onSubmit={handleSubmit} noValidate>
        <InputField
          label={t.fullName}
          icon={User}
          type="text"
          autoComplete="name"
          placeholder={t.fullName}
          value={values.fullName}
          error={touched.fullName ? errors.fullName : undefined}
          onChange={(val) => updateField('fullName', val)}
          onBlur={() => handleBlur('fullName')}
        />

        <InputField
          label={t.mobile}
          icon={Phone}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder={t.mobile}
          value={values.mobile}
          error={touched.mobile ? errors.mobile : undefined}
          onChange={(val) => updateField('mobile', val)}
          onBlur={() => handleBlur('mobile')}
        />

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
          autoComplete="new-password"
          placeholder={t.password}
          value={values.password}
          error={touched.password ? errors.password : undefined}
          onChange={(val) => updateField('password', val)}
          onBlur={() => handleBlur('password')}
        />

        <div className="login-form__row">
          <label className="login-form__checkbox">
            <input type="checkbox" checked={agree} onChange={toggleAgree} />
            <span className="login-form__checkbox-box" aria-hidden="true" />
            <span>{t.agree}</span>
          </label>
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
        <p>{t.already}</p>
        <button type="button" className="login-form__switch-btn" onClick={onSwitchToLogin}>
          {t.loginLink}
        </button>
      </div>

      <div className="login-form__divider">
        <span />
        <p>{t.or}</p>
        <span />
      </div>

      <SocialLogin 
        onLoginSuccess={onRegisterSuccess}
        onNotify={onNotify}
        onGoogleLogin={onGoogleLogin}
        onSelect={(provider) => onNotify(`${provider} registration is coming soon. Please use Google Sign-In or Email.`, 'info')} 
      />

      <div className="login-form__security">
        <SecurityCard />
      </div>
    </motion.section>
  )
}
