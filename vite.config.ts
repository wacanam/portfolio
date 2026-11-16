import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const basePath = process.env.VITE_BASE_PATH || '/';
const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
const rawSiteUrl = process.env.VITE_SITE_URL?.replace(/\/+$/, '');

// https://vitejs.dev/config/
export default defineConfig({
  base: normalizedBase,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'rewrite-site-metadata',
      transformIndexHtml(html) {
        if (!rawSiteUrl) return html;
        return html
          .replace('href="https://waveambray.dev/"', `href="${rawSiteUrl}/"`)
          .replace('"url": "https://waveambray.dev"', `"url": "${rawSiteUrl}"`)
          .replaceAll('content="/og-image.png"', `content="${rawSiteUrl}/og-image.png"`)
          .replaceAll(`content="${normalizedBase}og-image.png"`, `content="${rawSiteUrl}/og-image.png"`);
      },
    },
  ],
});
