import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

// ⛳ 替代 __dirname：
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // ✅ @ 映射到 src 目录
    }
  },
  server: {
    host: 'localhost',
    port: 5173, // 默认 Vite 端口
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端 Spring Boot 服务
        changeOrigin: true,
      }
    }
  }
})
