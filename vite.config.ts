import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
