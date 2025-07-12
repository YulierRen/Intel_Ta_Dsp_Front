import { createRouter, createWebHistory } from 'vue-router'
import Login from "../pages/Login.vue"
import Register from "../pages/Register.vue"
import Dashboard from "../pages/Dashboard.vue"
import Main from "../pages/Main.vue"
import Homepage from "../pages/homepage.vue";
import DiaryGround from "../pages/DiaryGround.vue";
import FriendList from "../pages/FriendList.vue"
import UserManage from "../pages/UserManage.vue"; // 新增引入

const routes = [
    { path: '/', redirected: '/manager/home', },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: Dashboard }, // 登录成功跳转页面
    { path: '/main', component: Main },
    { path: '/homepage', component: Homepage },
    { path: '/diaryground', component: DiaryGround },
    { path: '/friendlist', component: FriendList }, // 新增路由
    { path: '/usermanage', component: UserManage }
    { path: '/'}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
