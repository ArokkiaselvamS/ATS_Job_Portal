import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function embedHeroImagePlugin() {
  return {
    name: 'embed-hero-image',
    buildStart() {
      processImage()
    },
    configureServer(server) {
      processImage()
    }
  }
}

function processImage() {
  const src = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\fd9cc592-c86b-48c8-9d07-67ee7d39ce93\\media__1786961927138.jpg'
  const publicDest = path.resolve(__dirname, 'public/hero_full.jpg')
  const assetsDir = path.resolve(__dirname, 'src/assets')
  const assetsDest = path.resolve(assetsDir, 'hero_full.jpg')
  const jsDest = path.resolve(assetsDir, 'heroImageBase64.js')

  try {
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true })
    }
    const publicDir = path.resolve(__dirname, 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    if (fs.existsSync(src)) {
      // 1. Copy to public
      fs.copyFileSync(src, publicDest)
      // 2. Copy to src/assets
      fs.copyFileSync(src, assetsDest)

      // 3. Convert to base64 JS export so it NEVER fails to load!
      const imageBuffer = fs.readFileSync(src)
      const base64Str = imageBuffer.toString('base64')
      const dataUri = `data:image/jpeg;base64,${base64Str}`
      const jsContent = `export const heroImageUri = ${JSON.stringify(dataUri)};\nexport default heroImageUri;\n`
      fs.writeFileSync(jsDest, jsContent, 'utf-8')

      console.log('[Vite Plugin] Successfully processed hero image and created Base64 asset!')
    }
  } catch (err) {
    console.error('[Vite Plugin] Error processing image:', err)
  }
}

// Immediately run processImage on module load
processImage()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), embedHeroImagePlugin()],
  server: {
    port: 5173,
    open: true,
  }
})
