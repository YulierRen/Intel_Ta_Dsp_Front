import axios from 'axios'

// 创建实例
const instance = axios.create({
    baseURL: '/api', // 会被 Vite 的代理拦到后端
    timeout: 60000
})

// ✅ 请求拦截器：统一加 token
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    console.log(token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, error => {
    return Promise.reject(error)
})

// ✅ 响应拦截器：统一错误处理
instance.interceptors.response.use(response => {
    return response.data
}, error => {
    // if (error.response?.status === 401) {
    //     // 未授权，跳转登录
    //     window.location.href = '/login'
    // } else if (error.response?.status === 403) {
    //     alert('角色错误')
    // } else if (error.response?.status === 404) {
    //     alert('管理员好像把你删了，呼呼呼')
    // } else {
    //     console.error('请求失败', error)
    // }
    return Promise.reject(error)
})

// 无需更改
export default instance
