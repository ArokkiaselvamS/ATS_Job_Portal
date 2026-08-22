import { useId, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import './InputField.css'

export default function InputField({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  isPassword = false,
  inputMode,
}) {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="input-field">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <motion.div
        className={`input-field__shell ${focused ? 'is-focused' : ''} ${error ? 'has-error' : ''}`}
        animate={focused ? { boxShadow: '0 0 0 4px rgba(91,79,232,0.14)' } : { boxShadow: '0 0 0 0px rgba(91,79,232,0)' }}
        transition={{ duration: 0.2 }}
      >
        {Icon && (
          <span className="input-field__icon">
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <input
          id={id}
          type={resolvedType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e.target.value)
          }}
        />
        {isPassword && (
          <button
            type="button"
            className="input-field__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            className="input-field__error"
            role="alert"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
          >
            <AlertCircle size={13} strokeWidth={2.4} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
