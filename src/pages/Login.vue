<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

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
</script>

<template>
  <div class="login-bg">
    <div class="login-card animated-fadein">
      <div class="logo">
        <span class="logo-icon">🌈</span>
        <span class="logo-text">Kebiao</span>
      </div>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              required
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              required
          />
        </div>
        <button type="submit" class="btn-login">登录</button>
        <p class="error" v-if="error">{{ error }}</p>
        <p class="to-register">
          还没有账号？
          <router-link to="/register">点击注册</router-link>
        </p>
      </form>
    </div>
    <div class="bg-bubble bubble1"></div>
    <div class="bg-bubble bubble2"></div>
    <div class="bg-bubble bubble3"></div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.login-card {
  width: 380px;
  padding: 48px 36px 36px 36px;
  background: rgba(255,255,255,0.98);
  border-radius: 18px;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08);
  text-align: center;
  position: relative;
  z-index: 2;
  animation: card-pop 0.8s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes card-pop {
  0% { transform: scale(0.8) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.logo {
  font-size: 30px;
  font-weight: bold;
  color: #5563DE;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 2px;
}
.logo-icon {
  font-size: 32px;
  animation: logo-bounce 1.2s infinite alternate;
}
@keyframes logo-bounce {
  0% { transform: translateY(0);}
  100% { transform: translateY(-8px);}
}
.logo-text {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 700;
  color: #5563DE;
}
.login-form .form-group {
  margin-bottom: 20px;
  text-align: left;
}
.login-form label {
  display: block;
  margin-bottom: 7px;
  font-size: 15px;
  color: #5563DE;
  font-weight: 500;
}
.login-form input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e0e7ff;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.25s, box-shadow 0.25s;
  background: #f7faff;
  outline: none;
}
.login-form input:focus {
  border-color: #5563DE;
  box-shadow: 0 0 0 2px #a5b4fc44;
}
.btn-login {
  width: 100%;
  padding: 13px;
  margin-top: 10px;
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: background 0.3s, transform 0.15s;
  letter-spacing: 1px;
}
.btn-login:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: translateY(-2px) scale(1.03);
}
.error {
  margin-top: 14px;
  color: #e74c3c;
  font-size: 14px;
  animation: shake 0.3s;
}
@keyframes shake {
  0% { transform: translateX(0);}
  25% { transform: translateX(-5px);}
  50% { transform: translateX(5px);}
  75% { transform: translateX(-5px);}
  100% { transform: translateX(0);}
}
.to-register {
  margin-top: 24px;
  font-size: 15px;
  color: #888;
}
.to-register a {
  color: #5563DE;
  text-decoration: none;
  font-weight: 600;
  margin-left: 2px;
  transition: color 0.2s;
}
.to-register a:hover {
  color: #74ABE2;
  text-decoration: underline;
}
.bg-bubble {
  position: absolute;
  border-radius: 50%;
  opacity: 0.18;
  z-index: 1;
  filter: blur(2px);
  animation: float-bubble 8s infinite alternate;
}
.bubble1 {
  width: 220px; height: 220px;
  background: #74ABE2;
  left: -80px; top: 10%;
  animation-delay: 0s;
}
.bubble2 {
  width: 160px; height: 160px;
  background: #5563DE;
  right: -60px; top: 60%;
  animation-delay: 2s;
}
.bubble3 {
  width: 120px; height: 120px;
  background: #ffb6b9;
  left: 60%; top: 80%;
  animation-delay: 4s;
}
@keyframes float-bubble {
  0% { transform: translateY(0) scale(1);}
  100% { transform: translateY(-30px) scale(1.08);}
}
</style>
