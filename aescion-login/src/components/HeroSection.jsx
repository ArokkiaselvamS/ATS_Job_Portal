import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import heroFullImage from '../assets/hero_full.jpg'
import './HeroSection.css'

export default function HeroSection() {
  const [croppedSrc, setCroppedSrc] = useState(heroFullImage)

  useEffect(() => {
    if (!heroFullImage) return

    const img = new Image()
    img.src = heroFullImage
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        // Crop left illustration section (left 52.2% of the original image)
        const cropWidth = Math.floor(img.width * 0.522)
        const cropHeight = img.height
        canvas.width = cropWidth
        canvas.height = cropHeight

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
          setCroppedSrc(canvas.toDataURL('image/jpeg', 0.96))
        }
      } catch (e) {
        console.warn('Canvas cropping fallback:', e)
      }
    }
  }, [])

  return (
    <section className="hero-section" aria-label="Aescion EdTech Solutions">
      <motion.div
        className="hero-section__image-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src={croppedSrc}
          alt="Aescion EdTech Solutions - Empowering Education Through Technology"
          className="hero-section__exact-img"
        />
      </motion.div>
    </section>
  )
}
