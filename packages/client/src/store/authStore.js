import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)
    const token = ref(localStorage.getItem('token') || null)
    const refreshToken = ref(localStorage.getItem('refreshToken') || null)
    const loading = ref(false)
    const error = ref(null)

    const isAuthenticated = computed(() => !!token.value)

    // 配置 axios 默认 token
    if (token.value) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }

    // 注册
    async function register(phoneNumber, password, username) {
        loading.value = true
        error.value = null
        try {
            const response = await axios.post('/api/auth/register', {
                phoneNumber,
                password,
                username
            })

            const userData = response.data
            setAuthData(userData)
            return userData
        } catch (err) {
            error.value = err.response?.data?.message || '注册失败'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 登录
    async function login(identifier, password) {
        loading.value = true
        error.value = null
        try {
            const response = await axios.post('/api/auth/login', {
                identifier,
                password
            })

            const userData = response.data
            setAuthData(userData)
            return userData
        } catch (err) {
            error.value = err.response?.data?.message || '登录失败'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 退出登录
    async function logout() {
        if (user.value) {
            try {
                // 通知后端清除 Refresh Token (可选)
                await axios.post('/api/auth/logout', { userId: user.value._id });
            } catch (e) {
                console.warn('Logout notification failed', e);
            }
        }

        user.value = null
        token.value = null
        refreshToken.value = null
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        delete axios.defaults.headers.common['Authorization']
    }

    // 设置认证数据
    function setAuthData(userData) {
        user.value = userData
        token.value = userData.token
        refreshToken.value = userData.refreshToken

        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.token)
        if (userData.refreshToken) {
            localStorage.setItem('refreshToken', userData.refreshToken)
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
    }

    // 刷新 Token
    async function refreshAccessToken() {
        if (!refreshToken.value) {
            console.error('No refresh token available');
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post('/api/auth/refresh', {
                refreshToken: refreshToken.value
            });

            const newToken = response.data.token;
            token.value = newToken;
            localStorage.setItem('token', newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return newToken;
        } catch (err) {
            console.error('Refresh failed:', err);
            // 刷新失败，强制退出
            await logout();
            throw err;
        }
    }

    // 获取当前用户信息 (验证 token 有效性)
    async function fetchCurrentUser() {
        if (!token.value) return

        try {
            const response = await axios.get('/api/auth/me')
            user.value = { ...user.value, ...response.data }
            localStorage.setItem('user', JSON.stringify(user.value))
        } catch (err) {
            console.error('获取用户信息失败', err)
            // 不要在 fetchCurrentUser 中直接退出，让拦截器处理过期刷新逻辑
            // 如果拦截器最终失败，会调用 logout
        }
    }

    return {
        user,
        token,
        refreshToken,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        fetchCurrentUser,
        refreshAccessToken,
        setAuthData
    }
})
