<template>
    <div class="outline-container h-full flex flex-col bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <div class="p-3 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 flex justify-between items-center">
            <span>大纲</span>
            <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <div class="flex-1 overflow-y-auto p-2">
            <div v-if="outline.length === 0" class="text-gray-400 text-sm text-center mt-4">
                暂无大纲
            </div>
            <ul v-else class="space-y-1">
                <li v-for="(item, index) in outline" :key="index" 
                    class="text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-150"
                    :class="{ 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300': activeSlug === item.slug }"
                    :style="{ paddingLeft: (item.level - 1) * 12 + 8 + 'px' }"
                    @click="scrollToHeader(item.slug)"
                >
                    <div class="py-1 truncate" :title="item.title">
                        {{ item.title }}
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useDocumentStore } from '../store/documentStore'

const documentStore = useDocumentStore()
const outline = computed(() => documentStore.outline)
const activeSlug = ref('')

const emit = defineEmits(['close'])

// 滚动到指定标题
const scrollToHeader = (slug) => {
    activeSlug.value = slug
    const element = document.getElementById(slug)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
    }
}

// 监听滚动以高亮当前标题
let observer = null

const setupIntersectionObserver = () => {
    if (observer) observer.disconnect()
    
    const options = {
        root: null, // viewport
        rootMargin: '-100px 0px -60% 0px', // 顶部偏移 100px，底部偏移 60%
        threshold: 0
    }
    
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSlug.value = entry.target.id
            }
        })
    }, options)
    
    // 观察所有标题元素
    outline.value.forEach(item => {
        const element = document.getElementById(item.slug)
        if (element) observer.observe(element)
    })
}

// 当大纲变化时重新设置观察器
watch(outline, () => {
    // 等待 DOM 更新
    setTimeout(setupIntersectionObserver, 100)
}, { deep: true })

onMounted(() => {
    setTimeout(setupIntersectionObserver, 500)
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})
</script>

<style scoped>
.outline-container {
    min-width: 200px;
    max-width: 300px;
}
</style>