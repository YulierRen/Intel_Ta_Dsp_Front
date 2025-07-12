<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="notfound-container">
    <div class="notfound-content">
      <div class="notfound-icon">🚫</div>
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <button @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.notfound-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
}
.notfound-content {
  background: rgba(255,255,255,0.98);
  border-radius: 18px;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08);
  padding: 48px 36px 36px 36px;
  text-align: center;
  max-width: 350px;
}
.notfound-icon {
  font-size: 48px;
  margin-bottom: 18px;
}
h1 {
  font-size: 3.5rem;
  color: #5563DE;
  margin: 0 0 10px 0;
  font-weight: bold;
}
h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 12px;
}
p {
  color: #888;
  margin-bottom: 28px;
}
button {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: background 0.3s, transform 0.15s;
}
button:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: translateY(-2px) scale(1.03);
}
</style>