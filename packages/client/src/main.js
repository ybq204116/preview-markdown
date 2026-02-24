import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/style.css'
import axios from 'axios'
import { useAuthStore } from './store/authStore'

// 创建Pinia状态管理
const pinia = createPinia()

// 创建Vue应用
const app = createApp(App)

// 使用插件
app.use(pinia)

// 配置 Axios 拦截器
// 请求拦截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 响应拦截器
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

axios.interceptors.response.use(response => {
    return response
}, async error => {
    const originalRequest = error.config

    // 如果是 401 错误且不是登录接口本身，也不是刷新接口本身
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login') && !originalRequest.url.includes('/refresh')) {
        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject })
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token
                return axios(originalRequest)
            }).catch(err => {
                return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            // 需要在拦截器内部获取 store，因为 pinia 已经初始化
            const authStore = useAuthStore()
            const newToken = await authStore.refreshAccessToken()

            processQueue(null, newToken)
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken
            return axios(originalRequest)
        } catch (err) {
            processQueue(err, null)
            // 刷新失败，authStore.refreshAccessToken 会自动 logout
            return Promise.reject(err)
        } finally {
            isRefreshing = false
        }
    }

    return Promise.reject(error)
})

// 挂载应用
app.mount('#app') 