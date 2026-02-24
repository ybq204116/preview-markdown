import { defineStore } from 'pinia'
import axios from 'axios'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),

  actions: {
    async initTheme() {
      try {
        // 先尝试从本地读取，避免闪烁
        const localTheme = localStorage.getItem('theme')
        if (localTheme) {
          this.isDarkMode = localTheme === 'dark'
          this.applyTheme()
        }

        // 然后从后端同步
        const response = await axios.get('/api/settings')
        if (response.data && response.data.theme) {
          this.isDarkMode = response.data.theme === 'dark'
          this.applyTheme()
          localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
        }
      } catch (error) {
        console.warn('无法加载主题设置', error)
      }
    },

    async toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.applyTheme()
      
      const themeString = this.isDarkMode ? 'dark' : 'light'
      localStorage.setItem('theme', themeString)

      try {
        await axios.put('/api/settings', { theme: themeString })
      } catch (error) {
        console.error('无法保存主题设置', error)
      }
    },

    applyTheme() {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
}) 
