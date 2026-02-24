<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div class="mb-8 text-center">
            <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">Markdown 预览网站</h1>
            <p class="text-gray-600 dark:text-gray-400">请登录以开始使用</p>
        </div>
        
        <AuthForm @success="handleSuccess" />
    </div>
</template>

<script setup>
import AuthForm from './AuthForm.vue'
import { useAuthStore } from '../store/authStore'
import { useDocumentStore } from '../store/documentStore'

const authStore = useAuthStore()
const documentStore = useDocumentStore()

async function handleSuccess() {
    // 登录成功后，App.vue 会自动切换视图，这里可以执行额外的初始化
    try {
        await documentStore.loadDocuments()
    } catch (error) {
        console.error('Login success but failed to load documents:', error)
    }
}
</script>
