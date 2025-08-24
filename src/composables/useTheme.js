import { ref, watch } from 'vue'
import { resourceManager } from '@/utils/fileUtils'

// 主题状态
const isDarkMode = ref(false)

// 初始化主题设置
const initializeTheme = async () => {
  try {
    const savedTheme = await resourceManager.getTheme()
    isDarkMode.value = savedTheme === 'dark'
    console.log(`从数据库加载主题设置: ${savedTheme}`)
  } catch (error) {
    console.error('加载主题设置失败:', error)
    // 回退到localStorage
    const fallbackTheme = localStorage.getItem('music-player-theme')
    if (fallbackTheme) {
      isDarkMode.value = fallbackTheme === 'dark'
      // 迁移到数据库
      await resourceManager.saveTheme(isDarkMode.value)
      localStorage.removeItem('music-player-theme')
      console.log('已迁移主题设置到数据库')
    } else {
      // 默认使用浅色主题
      isDarkMode.value = false
      await resourceManager.saveTheme(false)
    }
  }
}

// 从数据库加载主题设置
const loadTheme = async () => {
  await initializeTheme()
  applyTheme()
}

// 应用主题
const applyTheme = () => {
  const root = document.documentElement

  if (isDarkMode.value) {
    // 夜晚模式
    root.style.setProperty('--bg-primary', 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)')
    root.style.setProperty('--bg-secondary', 'rgba(15, 23, 42, 0.9)')
    root.style.setProperty('--bg-tertiary', 'rgba(30, 41, 59, 0.95)')
    root.style.setProperty('--bg-card', 'rgba(30, 41, 59, 0.8)')
    root.style.setProperty('--bg-card-hover', 'rgba(51, 65, 85, 0.9)')
    root.style.setProperty('--bg-overlay', 'rgba(15, 23, 42, 0.95)')
    root.style.setProperty('--bg-surface', 'rgba(30, 41, 59, 0.8)')
    root.style.setProperty('--bg-surface-hover', 'rgba(51, 65, 85, 0.9)')
    root.style.setProperty('--bg-sidebar', 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)')

    root.style.setProperty('--text-primary', '#f8fafc')
    root.style.setProperty('--text-secondary', 'rgba(248, 250, 252, 0.8)')
    root.style.setProperty('--text-tertiary', 'rgba(248, 250, 252, 0.6)')
    root.style.setProperty('--text-muted', 'rgba(248, 250, 252, 0.5)')

    root.style.setProperty('--border-primary', 'rgba(248, 250, 252, 0.1)')
    root.style.setProperty('--border-secondary', 'rgba(248, 250, 252, 0.2)')
    root.style.setProperty('--border-light', 'rgba(248, 250, 252, 0.15)')
    root.style.setProperty('--border-medium', 'rgba(248, 250, 252, 0.25)')

    root.style.setProperty('--shadow-light', '0 4px 16px rgba(0, 0, 0, 0.3)')
    root.style.setProperty('--shadow-medium', '0 8px 24px rgba(0, 0, 0, 0.4)')
    root.style.setProperty('--shadow-heavy', '0 12px 32px rgba(0, 0, 0, 0.5)')
    root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.2)')
    root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.3)')

    // 主色调保持不变
    root.style.setProperty('--color-primary', '#667eea')
    root.style.setProperty('--color-primary-light', 'rgba(102, 126, 234, 0.2)')
    root.style.setProperty('--color-primary-medium', 'rgba(102, 126, 234, 0.4)')
    root.style.setProperty('--color-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')

    document.body.classList.add('dark-theme')
    document.body.classList.remove('light-theme')
  } else {
    // 浅色主题
    root.style.setProperty('--bg-primary', 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)')
    root.style.setProperty('--bg-secondary', 'rgba(255, 255, 255, 0.8)')
    root.style.setProperty('--bg-tertiary', 'rgba(255, 255, 255, 0.95)')
    root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.8)')
    root.style.setProperty('--bg-card-hover', 'rgba(255, 255, 255, 0.95)')
    root.style.setProperty('--bg-overlay', 'rgba(255, 255, 255, 0.9)')
    root.style.setProperty('--bg-surface', 'rgba(255, 255, 255, 0.8)')
    root.style.setProperty('--bg-surface-hover', 'rgba(255, 255, 255, 0.95)')
    root.style.setProperty('--bg-sidebar', 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)')

    root.style.setProperty('--text-primary', '#1e293b')
    root.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.7)')
    root.style.setProperty('--text-tertiary', 'rgba(0, 0, 0, 0.6)')
    root.style.setProperty('--text-muted', 'rgba(0, 0, 0, 0.5)')

    root.style.setProperty('--border-primary', 'rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--border-secondary', 'rgba(0, 0, 0, 0.2)')
    root.style.setProperty('--border-light', 'rgba(0, 0, 0, 0.15)')
    root.style.setProperty('--border-medium', 'rgba(0, 0, 0, 0.25)')

    root.style.setProperty('--shadow-light', '0 4px 16px rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--shadow-medium', '0 8px 24px rgba(0, 0, 0, 0.15)')
    root.style.setProperty('--shadow-heavy', '0 12px 32px rgba(0, 0, 0, 0.2)')
    root.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.15)')

    // 主色调保持不变
    root.style.setProperty('--color-primary', '#667eea')
    root.style.setProperty('--color-primary-light', 'rgba(102, 126, 234, 0.2)')
    root.style.setProperty('--color-primary-medium', 'rgba(102, 126, 234, 0.4)')
    root.style.setProperty('--color-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')

    document.body.classList.add('light-theme')
    document.body.classList.remove('dark-theme')
  }
}

// 切换主题
const toggleTheme = async () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme()

  // 保存到数据库
  try {
    await resourceManager.saveTheme(isDarkMode.value)
    console.log(`已切换到${isDarkMode.value ? '夜晚' : '日间'}模式并保存到数据库`)
  } catch (error) {
    console.error('保存主题设置失败:', error)
    // 回退到localStorage作为备份
    localStorage.setItem('music-player-theme', isDarkMode.value ? 'dark' : 'light')
  }
}

// 监听主题变化并保存到数据库
watch(isDarkMode, async (newValue) => {
  try {
    await resourceManager.saveTheme(newValue)
  } catch (error) {
    console.error('自动保存主题设置失败:', error)
    // 回退到localStorage作为备份
    localStorage.setItem('music-player-theme', newValue ? 'dark' : 'light')
  }
}, { immediate: false }) // 不立即执行，避免初始化时重复保存

// 导出主题管理功能
export function useTheme() {
  return {
    isDarkMode,
    toggleTheme,
    loadTheme,
    applyTheme
  }
}

// 立即初始化主题（在模块加载时执行）
initializeTheme().then(() => {
  applyTheme()
}).catch(error => {
  console.error('初始化主题失败:', error)
  // 使用默认主题
  isDarkMode.value = false
  applyTheme()
})
