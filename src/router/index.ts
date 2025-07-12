import { createRouter, createWebHistory } from 'vue-router'
import Login from "../pages/Login.vue"
import Register from "../pages/Register.vue"
import Dashboard from "../pages/Dashboard.vue"
import Homepage from "../pages/homepage.vue";
import DiaryGround from "../pages/DiaryGround.vue";
import FriendList from "../pages/FriendList.vue"
import UserManage from "../pages/UserManage.vue"; // 新增引入


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: "/login",
            meta: {title: "跳转中..."}
        },
        {
            path: '/login',
            meta: {title: "登录"},
            component: Login
        },
        {
            path: '/register',
            meta: {title: "注册"},
            component: Register
        },
        {
            path: '/dashboard',
            meta: {title: "日程表"},
            component: Dashboard
        },
        {
            path: '/homepage',
            meta: {title: "主页"},
            component: Homepage
        },
        {
            path: '/diaryground',
            meta: {title: "他律广场"},
            component: DiaryGround
        },
        {
            path: '/friendlist',
            meta: {title: "好友日程"},
            component: FriendList
        },
        {
            path: '/usermanage',
            meta: {title: "用户管理"},
            component: UserManage
        },
        {
            path: '/404NotFound',
            name: '404NotFound',
            meta: {title: "404 NotFound"},
            component: () => import('../pages/NotFound.vue')
        },
        {
            path: "/:pathMatch(.*)",
            redirect: '/404NotFound'
        }

    ]
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title as string
    console.log(from.meta + ' to ' + to.meta)
    next()
})

export default router