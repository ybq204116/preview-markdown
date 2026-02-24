<template>
    <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center space-x-2">
            <button class="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none" @click="toggleMobileMenu">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                    <path d="M7 16V8l4 4 4-4v8" />
                </svg>
                <h1 class="text-lg font-bold text-gray-800 dark:text-white">Markdown预览网站</h1>
            </div>
        </div>

        <!-- 中间：编辑器工具栏 -->
        <div class="hidden md:flex items-center space-x-2 mx-4">
            <!-- 标题下拉菜单 -->
            <div class="relative">
                <button @click="toggleHeadingsMenu" class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 flex items-center">
                    标题
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div v-if="showHeadingsMenu" class="absolute left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50 dark:bg-gray-800 dark:border-gray-700">
                    <button @click="setHeading(1)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-bold text-xl">H1 标题</button>
                    <button @click="setHeading(2)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-bold text-lg">H2 标题</button>
                    <button @click="setHeading(3)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-bold text-base">H3 标题</button>
                    <button @click="setHeading(4)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-bold">H4 标题</button>
                    <button @click="setHeading(5)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-bold">H5 标题</button>
                    <button @click="setHeading(6)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-bold">H6 标题</button>
                </div>
            </div>

            <!-- 格式下拉菜单 -->
            <div class="relative">
                <button @click="toggleFormatMenu" class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 flex items-center">
                    格式
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div v-if="showFormatMenu" class="absolute left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50 dark:bg-gray-800 dark:border-gray-700">
                    <button @click="setFormat('bold')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-bold">粗体</button>
                    <button @click="setFormat('italic')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 italic">斜体</button>
                    <button @click="setFormat('strikethrough')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 line-through">删除线</button>
                    <button @click="setFormat('quote')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">引用</button>
                    <button @click="setFormat('code')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-mono">行内代码</button>
                    <button @click="setFormat('codeblock')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 font-mono">代码块</button>
                    <button @click="setFormat('link')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 text-blue-500">链接</button>
                    <button @click="setFormat('table')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">表格</button>
                </div>
            </div>
        </div>

        <div class="flex items-center space-x-2">
            <button
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none hidden md:block"
                @click="documentStore.toggleOutline" title="切换大纲">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{'text-blue-500': documentStore.isOutlineOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                @click="exportPDF" title="导出PDF">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    <text x="8.5" y="16" font-size="8" stroke-width="0" fill="currentColor">PDF</text>
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                @click="toggleTheme" title="切换主题">
                <svg v-if="!themeStore.isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </button>

            <!-- 登录/用户信息 -->
            <div class="relative ml-2">
                <div v-if="authStore.isAuthenticated" class="flex items-center space-x-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                        {{ authStore.user?.username || authStore.user?.phoneNumber }}
                    </span>
                    <button @click="handleLogout"
                        class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="退出登录">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDocumentStore } from '../store/documentStore'
import html2pdf from 'html2pdf.js'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'

const documentStore = useDocumentStore()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

// 菜单状态
const showHeadingsMenu = ref(false)
const showFormatMenu = ref(false)

const toggleHeadingsMenu = (e) => {
    e.stopPropagation()
    showHeadingsMenu.value = !showHeadingsMenu.value
    showFormatMenu.value = false
}

const toggleFormatMenu = (e) => {
    e.stopPropagation()
    showFormatMenu.value = !showFormatMenu.value
    showHeadingsMenu.value = false
}

const closeMenus = () => {
    showHeadingsMenu.value = false
    showFormatMenu.value = false
}

onMounted(() => {
    document.addEventListener('click', closeMenus)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', closeMenus)
})

const setHeading = (level) => {
    documentStore.triggerEditorAction({ type: 'heading', payload: level })
    closeMenus()
}

const setFormat = (type) => {
    documentStore.triggerEditorAction({ type })
    closeMenus()
}

function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        authStore.logout()
    }
}

// 切换移动端菜单
function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 切换深色/浅色主题
function toggleTheme() {
    themeStore.toggleTheme()
}

// 导出为PDF
function exportPDF() {
    if (!documentStore.currentDocument) {
        alert('请先选择或创建一个文档')
        return
    }

    const element = document.querySelector('.markdown-preview')
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `${documentStore.currentDocument.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    html2pdf().set(opt).from(element).save()
}
</script>