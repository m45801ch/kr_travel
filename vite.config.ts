import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'prompt', includeAssets: ['icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'], manifest: { name: '旅遊規劃', short_name: '旅遊', description: '跨國旅遊規劃與記帳 PWA', theme_color: '#ef8490', background_color: '#fffaf0', display: 'standalone', start_url: '/itinerary', scope: '/', lang: 'zh-TW', icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }, { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] } })],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
