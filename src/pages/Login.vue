<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()

async function login() {
  const res = await axios.post('/api/auth/login', {
    username: username.value,
    password: password.value
  })

  localStorage.setItem('token', res.data)
  await router.push('/dashboard') // 登录成功后跳转页面
}
</script>

<template>
  <div>
    <h2>登录</h2>
    <input v-model="username" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button @click="login">登录</button>
  </div>
</template>
