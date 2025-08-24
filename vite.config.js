import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve:{
    alias:{
      '@':path.resolve(__dirname,'src')
    }
  },

  server: {
    port: 5173,        // 改为5173端口以配合Electron
    strictPort: true,  // 如果端口被占用则报错，而不是自动切换
    host: true,        // 允许外部访问
    proxy: {
      // 代理网易云API请求
      '/api/netease': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/netease/, '')
      }
    }
  },

  base: './',  // 设置相对路径，用于Electron打包

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
