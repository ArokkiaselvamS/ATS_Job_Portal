import { motion } from 'framer-motion'
import { GraduationCap, User } from 'lucide-react'
import './RoleSwitcher.css'

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'employee', label: 'Employee', icon: User },
]

export default function RoleSwitcher({ role, onChange }) {
  return (
    <div className="role-switcher" role="tablist" aria-label="Login as">
      {ROLES.map(({ id, label, icon: Icon }) => {
        const active = role === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`role-switcher__tab ${active ? 'is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            {active && (
              <motion.span
                layoutId="role-pill"
                className="role-switcher__pill"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="role-switcher__content">
              <Icon size={17} strokeWidth={2.2} />
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
