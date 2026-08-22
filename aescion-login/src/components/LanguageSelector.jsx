import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, ChevronDown, Check } from 'lucide-react'
import './LanguageSelector.css'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
]

export default function LanguageSelector({ language, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  return (
    <div className="language-selector" ref={rootRef}>
      <motion.button
        type="button"
        className="language-selector__trigger"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Globe size={16} strokeWidth={2} />
        <span>{current.label.split(' ')[0]}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="language-selector__chevron">
          <ChevronDown size={15} strokeWidth={2} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="language-selector__menu"
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {LANGUAGES.map((lang) => (
              <li key={lang.code} role="option" aria-selected={lang.code === language}>
                <button
                  type="button"
                  className="language-selector__option"
                  onClick={() => {
                    onChange(lang.code)
                    setOpen(false)
                  }}
                >
                  <span>{lang.label}</span>
                  {lang.code === language && <Check size={15} strokeWidth={2.4} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export { LANGUAGES }
