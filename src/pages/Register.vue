<script setup>
import { ref } from 'vue'
import axios from '@/utils/axios'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()
const error = ref('')

async function register() {
  try {
    await axios.post('/auth/register', {
      username: username.value,
      password: password.value
    })
    router.push('/login')
  } catch (e) {
    error.value = e.message
  }
}
</script>


<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">demo</div>
      <form @submit.prevent="register" class="login-form">
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
        <div class="form-group">
          <label>确认密码</label>
          <input
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              required
          />
        </div>
        <button type="submit" class="btn-login">注册</button>
        <p class="error" v-if="error">{{ error }}</p>
        <p class="to-register">
          已有账号？
          <router-link to="/login">返回登录</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #74ABE2, #5563DE);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  width: 360px;
  padding: 40px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #5563DE;
  margin-bottom: 24px;
}

.login-form .form-group {
  margin-bottom: 16px;
  text-align: left;
}

.login-form label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
}

.login-form input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.login-form input:focus {
  border-color: #5563DE;
  outline: none;
}

.btn-login {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  background-color: #5563DE;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-login:hover {
  background-color: #3f4db4;
}

.error {
  margin-top: 12px;
  color: #e74c3c;
  font-size: 13px;
}

.to-register {
  margin-top: 20px;
  font-size: 14px;
  color: #777;
}

.to-register a {
  color: #5563DE;
  text-decoration: none;
  font-weight: 500;
}

.to-register a:hover {
  text-decoration: underline;
}
</style>

