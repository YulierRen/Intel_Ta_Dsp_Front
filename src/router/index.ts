import { createRouter, createWebHistory } from 'vue-router'
import Login from "../pages/Login.vue"
import Register from "../pages/Register.vue"
import Dashboard from "../pages/Dashboard.vue"

const routes = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: Dashboard }, // 登录成功跳转页面
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
