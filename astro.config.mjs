import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://weijun.one',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  // Keep the first render styled even while a new container is replacing the
  // previous release. Interactive chunks remain content-hashed and cacheable.
  build: { inlineStylesheets: 'always' },
});
