import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  // 静态资源处理
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  // 确保静态资源路径正确解析
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@codemirror') || id.includes('vue-codemirror')) {
              return 'editor-vendor';
            }
            if (id.includes('markdown-it') || id.includes('highlight.js') || id.includes('katex') || id.includes('mermaid')) {
              return 'markdown-vendor';
            }
            if (id.includes('vue') || id.includes('pinia') || id.includes('axios')) {
              return 'framework-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
}) 