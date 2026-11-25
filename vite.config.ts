import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:5000' } };

  return {
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['icon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'الجيارة - الحسابات',
          short_name: 'الجيارة',
          description: 'حسابات العملاء والخزنة والشيكات',
          lang: 'ar',
          dir: 'rtl',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#0a0a0b',
          theme_color: '#0b0f17',
          icons: [
            { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // App shell only. API responses are never cached: old money figures are dangerous.
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallbackDenylist: [/^\/api/],
        },
      }),
    ],
  };
});
