<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const particles = ref([])
const canvasRef = ref(null)
const animationFrameId = ref(null)

async function login() {
  error.value = ''
  try {
    const res = await axios.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    localStorage.setItem('token', res.token)
    localStorage.setItem('studentId', res.studentId)
    router.push('/dashboard')
  } catch (err) {
    error.value = err?.response?.data?.msg || '登录失败，请检查用户名或密码'
  }
}

function createParticles(count = 50) {
  const newParticles = []
  const canvas = canvasRef.value
  if (!canvas) return newParticles

  for (let i = 0; i < count; i++) {
    newParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      color: i % 3 === 0 ? '#74ABE2' : i % 3 === 1 ? '#5563DE' : '#A5B4FE',
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      alpha: Math.random() * 0.6 + 0.2,
      glow: Math.random() * 10 + 5
    })
  }
  return newParticles
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = 'rgba(240, 249, 255, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  particles.value.forEach((p, index) => {
    p.x += p.speedX
    p.y += p.speedY

    if (p.x < 0 || p.x > canvas.width) p.speedX = -p.speedX
    if (p.y < 0 || p.y > canvas.height) p.speedY = -p.speedY

    const gradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.glow
    )
    gradient.addColorStop(0, `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${p.color}00`)

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
  })

  for (let i = 0; i < particles.value.length; i++) {
    for (let j = i + 1; j < particles.value.length; j++) {
      const p1 = particles.value[i]
      const p2 = particles.value[j]
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        ctx.strokeStyle = `rgba(116, 171, 226, ${0.2 - distance / 500})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
    }
  }

  animationFrameId.value = requestAnimationFrame(draw)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    resizeCanvas()
    particles.value = createParticles(80)
    draw()
    window.addEventListener('resize', resizeCanvas)
  }
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="login-container">
    <!-- 粒子背景画布 -->
    <canvas ref="canvasRef" class="particles-canvas"></canvas>

    <!-- 背景流光效果 -->
    <div class="bg-lights">
      <div class="light-wave wave-1"></div>
      <div class="light-wave wave-2"></div>
      <div class="light-wave wave-3"></div>
    </div>

    <!-- 新增左侧内容区 -->
    <div class="left-panel">
      <div class="welcome-box">
        <h1>欢迎使用课表系统</h1>
        <p>高效管理您的学习计划与课程安排</p>
        <div class="feature-list">
          <div class="feature-item">
            <span class="icon">📅</span>
            <div>
              <h3>智能课表</h3>
              <p>直观展示每周课程安排</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="icon">🔔</span>
            <div>
              <h3>课程提醒</h3>
              <p>重要课程不再错过</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="icon">📊</span>
            <div>
              <h3>学习统计</h3>
              <p>可视化您的学习进度</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 原有登录框（完全保持原有效果） -->
    <div class="login-content">
      <div class="logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">登录</span>
      </div>

      <h2 class="login-title">欢迎登录</h2>
      <p class="login-subtitle">请输入账号信息以继续</p>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-field">
            <input
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                required
                class="transparent-input"
            />
            <span class="input-icon">👤</span>
          </div>
        </div>
        <div class="form-group">
          <label>密码</label>
          <div class="input-field">
            <input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                required
                class="transparent-input"
            />
            <span class="input-icon">🔒</span>
          </div>
        </div>
        <button type="submit" class="btn-login">登录</button>
        <p class="error" v-if="error">{{ error }}</p>
        <p class="to-register">
          还没有账号？
          <router-link to="/register">点击注册</router-link>
        </p>
      </form>

      <footer class="page-footer">
        &copy; 2023 Kebiao 系统
      </footer>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f0f9ff;
  display: flex;
}

/* 左侧面板样式 */
.left-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 5;
  color: #fff;
}

.welcome-box {
  max-width: 600px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.welcome-box h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.welcome-box p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  cursor: default;
}

.feature-item:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-3px);
}

.feature-item .icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.feature-item p {
  font-size: 0.95rem;
  opacity: 0.8;
  margin: 0;
}

/* 原有登录框样式（完全保持原样） */
.login-content {
  position: relative;
  width: 400px;
  padding: 2rem;
  margin-right: 2rem;
  align-self: center;
  z-index: 10;
  backdrop-filter: blur(12px);
  background: rgba(65, 136, 199, 0.44);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1s ease-out forwards;
}

.login-title {
  color: #fff;
  font-size: 28px;
  text-align: center;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0 0 35px 0;
  font-size: 16px;
}

.logo {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-icon {
  font-size: 40px;
  animation: float 3s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(116, 171, 226, 0.6);
}

.logo-text {
  background: linear-gradient(90deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.input-field {
  position: relative;
}

.transparent-input {
  width: 100%;
  padding: 14px 48px 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  outline: none;
  box-sizing: border-box;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.transparent-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.transparent-input:focus {
  border-color: rgba(116, 171, 226, 0.8);
  box-shadow: 0 0 0 3px rgba(116, 171, 226, 0.3);
  background: rgba(255, 255, 255, 0.2);
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  transition: color 0.3s;
}

.transparent-input:focus ~ .input-icon {
  color: #fff;
  text-shadow: 0 0 10px rgba(116, 171, 226, 0.8);
}

.btn-login {
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  background: linear-gradient(90deg, rgba(116, 171, 226, 0.8), rgba(85, 99, 222, 0.8));
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

.btn-login::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
  );
  transition: 0.6s;
}

.btn-login:hover::after {
  left: 100%;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(116, 171, 226, 0.4);
}

.error {
  margin: 16px 0 0 0;
  color: rgba(255, 85, 85, 0.9);
  font-size: 14px;
  text-align: center;
  padding: 10px;
  background: rgba(255, 240, 240, 0.2);
  border-radius: 10px;
  border-left: 3px solid rgba(255, 85, 85, 0.8);
  backdrop-filter: blur(5px);
  animation: shake 0.5s ease;
}

.to-register {
  margin: 24px 0 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.to-register a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: all 0.3s;
  position: relative;
  text-shadow: 0 1px 5px rgba(116, 171, 226, 0.5);
}

.to-register a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.7);
  transition: width 0.3s;
}

.to-register a:hover {
  color: #f0f9ff;
}

.to-register a:hover::after {
  width: 100%;
}

.page-footer {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-top: 40px;
  text-align: center;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.particles-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.bg-lights {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.light-wave {
  position: absolute;
  filter: blur(150px);
  opacity: 0.5;
  animation: wave 20s ease-in-out infinite;
}

.wave-1 {
  width: 1200px;
  height: 1200px;
  top: -600px;
  left: -300px;
  background: linear-gradient(135deg, rgba(116, 171, 226, 0.4), rgba(85, 99, 222, 0.3));
}

.wave-2 {
  width: 1000px;
  height: 1000px;
  bottom: -500px;
  right: -200px;
  background: linear-gradient(135deg, rgba(165, 180, 254, 0.4), rgba(116, 171, 226, 0.3));
  animation-delay: -7s;
}

.wave-3 {
  width: 800px;
  height: 800px;
  top: 30%;
  right: 20%;
  background: linear-gradient(135deg, rgba(191, 219, 254, 0.3), rgba(165, 180, 254, 0.3));
  animation-delay: -12s;
}

@keyframes wave {
  0% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    transform: translate(0, 0) scale(1);
  }
  50% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: translate(20px, 30px) scale(1.05);
  }
  100% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }

  .left-panel {
    padding: 2rem 1rem;
    text-align: center;
  }

  .login-content {
    width: auto;
    max-width: 400px;
    margin: 0 auto 2rem;
  }

  .feature-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .feature-item {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 1.5rem;
    margin: 0 1rem 2rem;
  }

  .login-title {
    font-size: 24px;
  }

  .logo {
    font-size: 32px;
  }

  .feature-item {
    min-width: 100%;
  }
}
.input-field {
  position: relative;
  transition: transform 0.3s ease;
}

.input-field:hover {
  transform: translateY(-2px);
}

.transparent-input {
  /* 原有样式保持不变 */
  transition: all 0.3s ease, box-shadow 0.3s ease;
}

.transparent-input:hover {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(116, 171, 226, 0.3);
  background: rgba(255, 255, 255, 0.2);
}

.transparent-input:hover::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.input-icon {
  /* 原有样式保持不变 */
  transition: all 0.3s ease;
}

.transparent-input:hover ~ .input-icon {
  transform: translateY(-50%) scale(1.1);
  color: rgba(255, 255, 255, 0.9);
}

/* 增强焦点效果 */
.transparent-input:focus {
  border-color: rgba(116, 171, 226, 0.9);
  box-shadow: 0 0 0 3px rgba(116, 171, 226, 0.4);
  background: rgba(255, 255, 255, 0.25);
}

.transparent-input:focus ~ .input-icon {
  transform: translateY(-50%) scale(1.2);
  color: #fff;
  text-shadow: 0 0 15px rgba(116, 171, 226, 0.9);
}

/* 按钮悬停效果增强 */
.btn-login:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(116, 171, 226, 0.5);
}

.btn-login:active {
  transform: translateY(0);
  box-shadow: 0 5px 20px rgba(116, 171, 226, 0.4);
}
</style>