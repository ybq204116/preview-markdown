<template>
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">{{ isLoginMode ? '登录' : '注册' }}</h2>
        
        <div v-if="error" class="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {{ error }}
        </div>

        <form @submit.prevent="handleSubmit">
            <div class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" :for="isLoginMode ? 'identifier' : 'phoneNumber'">
                    {{ isLoginMode ? '账号' : '手机号' }}
                </label>
                <!-- 登录模式输入框 -->
                <input 
                    v-if="isLoginMode"
                    v-model="identifier"
                    type="text" 
                    id="identifier" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="请输入手机号或用户名"
                    required
                />
                <!-- 注册模式输入框 -->
                <input 
                    v-else
                    v-model="phoneNumber"
                    type="tel" 
                    id="phoneNumber" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="请输入手机号"
                    required
                />
            </div>

            <div v-if="!isLoginMode" class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="username">
                    用户名
                </label>
                <input 
                    v-model="username"
                    type="text" 
                    id="username" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="请输入用户名"
                    required
                />
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="password">
                    密码
                </label>
                <input 
                    v-model="password"
                    type="password" 
                    id="password" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="请输入密码"
                    required
                />
            </div>

            <div v-if="!isLoginMode" class="mb-6">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="confirmPassword">
                    确认密码
                </label>
                <input 
                    v-model="confirmPassword"
                    type="password" 
                    id="confirmPassword" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="请再次输入密码"
                    required
                />
            </div>

            <div class="flex items-center justify-between mb-6">
                <button 
                    type="button" 
                    @click="toggleMode"
                    class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                >
                    {{ isLoginMode ? '没有账号？去注册' : '已有账号？去登录' }}
                </button>
            </div>

            <button 
                type="submit" 
                class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center font-bold transition-colors"
                :disabled="loading"
            >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoginMode ? '登录' : '注册' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store/authStore'

const emit = defineEmits(['success'])

const authStore = useAuthStore()
const isLoginMode = ref(true)
const identifier = ref('')
const phoneNumber = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const loading = computed(() => authStore.loading)

function toggleMode() {
    isLoginMode.value = !isLoginMode.value
    error.value = ''
    password.value = ''
    confirmPassword.value = ''
    username.value = ''
    identifier.value = ''
    phoneNumber.value = ''
}

async function handleSubmit() {
    error.value = ''
    
    if (isLoginMode.value) {
        if (!identifier.value || !password.value) {
            error.value = '请填写账号和密码'
            return
        }
    } else {
        if (!phoneNumber.value || !password.value || !username.value) {
            error.value = '请填写所有字段'
            return
        }
        if (password.value !== confirmPassword.value) {
            error.value = '两次输入的密码不一致'
            return
        }
    }

    try {
        if (isLoginMode.value) {
            await authStore.login(identifier.value, password.value)
        } else {
            await authStore.register(phoneNumber.value, password.value, username.value)
        }
        emit('success')
    } catch (err) {
        error.value = authStore.error || '操作失败'
    }
}
</script>
