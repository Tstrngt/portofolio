import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tstrngt.github.io',
  base: process.env.GITHUB_PAGES === 'true' ? '/portofolio' : '/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
