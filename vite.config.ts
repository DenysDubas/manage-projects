import { copyFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      if (process.env.GITHUB_PAGES !== 'true') return

      const outDir = join(fileURLToPath(new URL('.', import.meta.url)), 'dist')
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/manage-projects/' : '/',
  plugins: [vue(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`,
      },
    },
  },
})
