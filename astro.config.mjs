import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  base: process.env.GITHUB_PAGES === 'true' ? '/team-friday-fun/' : '/',
  outDir: './dist',
  build: {
    format: 'directory',
  },
  vite: {
    server: {
      proxy: {
        '/api/tff': 'http://127.0.0.1:8787',
      },
    },
  },
});
