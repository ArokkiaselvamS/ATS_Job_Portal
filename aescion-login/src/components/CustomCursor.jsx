import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './CustomCursor.css'

const INTERACTIVE_SELECTOR = 'a, button, input, [role="button"], [role="tab"], [role="option"], label'

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    const isWide = window.matchMedia('(min-width: 861px)').matches
    setEnabled(isFinePointer && isWide)
  }, [])

  useEffect(() => {
    if (!enabled) return

    function handleMove(e) {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
      const el = e.target.closest(INTERACTIVE_SELECTOR)
      setExpanded(Boolean(el))
    }
    function handleLeave() {
      setVisible(false)
    }

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <motion.div
      className={`custom-cursor ${expanded ? 'is-expanded' : ''}`}
      animate={{
        x: pos.x,
        y: pos.y,
        opacity: visible ? 1 : 0,
        scale: expanded ? 1.8 : 1,
      }}
      transition={{ type: 'spring', stiffness: 900, damping: 45, mass: 0.4 }}
      aria-hidden="true"
    />
  )
}
