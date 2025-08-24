<template>
  <div class="settings-modal-overlay" @click="handleOverlayClick">
    <div class="settings-modal" @click.stop>
      <div class="settings-header">
        <h2>用户设置</h2>
        <button class="close-btn" @click="$emit('close')" title="关闭">
          <span>×</span>
        </button>
      </div>

      <div class="settings-content">
        <!-- 主题设置 -->
        <div class="setting-section">
          <div class="section-header">
            <h3>🎨 主题设置</h3>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">主题模式</div>
              <div class="setting-description">选择您喜欢的界面主题</div>
            </div>
            <div class="setting-control">
              <div class="theme-selector">
                <button 
                  class="theme-option" 
                  :class="{ active: !isDarkMode }"
                  @click="setTheme(false)"
                >
                  <span class="theme-icon">☀️</span>
                  <span class="theme-name">浅色</span>
                </button>
                <button 
                  class="theme-option" 
                  :class="{ active: isDarkMode }"
                  @click="setTheme(true)"
                >
                  <span class="theme-icon">🌙</span>
                  <span class="theme-name">深色</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="setting-section">
          <div class="section-header">
            <h3>💾 数据管理</h3>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">存储信息</div>
              <div class="setting-description">查看应用数据存储情况</div>
            </div>
            <div class="setting-control">
              <div class="storage-info">
                <div class="storage-item">
                  <span class="storage-label">主题设置:</span>
                  <span class="storage-value">{{ currentTheme }}</span>
                </div>
                <div class="storage-item">
                  <span class="storage-label">数据库版本:</span>
                  <span class="storage-value">v{{ dbVersion }}</span>
                </div>
                <div class="storage-item">
                  <span class="storage-label">存储位置:</span>
                  <span class="storage-value">IndexedDB</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">重置设置</div>
              <div class="setting-description">清除所有用户设置，恢复默认状态</div>
            </div>
            <div class="setting-control">
              <button class="reset-btn" @click="resetSettings">
                <span class="btn-icon">🔄</span>
                重置所有设置
              </button>
            </div>
          </div>
        </div>

        <!-- 关于信息 -->
        <div class="setting-section">
          <div class="section-header">
            <h3>ℹ️ 关于</h3>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">音乐播放器</div>
              <div class="setting-description">基于 Vue 3 构建的现代音乐播放器</div>
            </div>
            <div class="setting-control">
              <div class="app-info">
                <div class="info-item">版本: 1.0.0</div>
                <div class="info-item">构建时间: {{ buildTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <button class="save-btn" @click="saveAndClose">
          <span class="btn-icon">💾</span>
          保存并关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { resourceManager } from '@/utils/fileUtils'

const emit = defineEmits(['close', 'theme-changed'])

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const currentTheme = computed(() => props.isDarkMode ? '深色主题' : '浅色主题')
const dbVersion = ref(3)
const buildTime = ref(new Date().toLocaleDateString('zh-CN'))

// 设置主题
const setTheme = async (isDark) => {
  try {
    await resourceManager.saveTheme(isDark)
    emit('theme-changed', isDark)
    console.log(`主题已切换为: ${isDark ? '深色' : '浅色'}`)
  } catch (error) {
    console.error('保存主题设置失败:', error)
  }
}

// 重置所有设置
const resetSettings = async () => {
  if (confirm('确定要重置所有设置吗？这将清除所有用户偏好设置。')) {
    try {
      // 删除主题设置
      await resourceManager.deleteSetting('theme')
      
      // 重置为默认主题
      await resourceManager.saveTheme(false)
      emit('theme-changed', false)
      
      alert('设置已重置为默认值')
      console.log('用户设置已重置')
    } catch (error) {
      console.error('重置设置失败:', error)
      alert('重置设置失败，请稍后重试')
    }
  }
}

// 保存并关闭
const saveAndClose = () => {
  emit('close')
}

// 处理遮罩点击
const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

onMounted(() => {
  console.log('用户设置组件已加载')
})
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.settings-modal {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface-hover);
}

.settings-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-primary-light);
  color: var(--text-primary);
}

.settings-content {
  padding: var(--space-xl);
  max-height: 60vh;
  overflow-y: auto;
}

.setting-section {
  margin-bottom: var(--space-2xl);
}

.section-header h3 {
  margin: 0 0 var(--space-lg) 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  background: var(--bg-surface-hover);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  border: 1px solid var(--border-light);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.setting-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.setting-control {
  margin-left: var(--space-lg);
}

.theme-selector {
  display: flex;
  gap: var(--space-sm);
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--bg-surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.theme-option:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.theme-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.theme-icon {
  font-size: 1.5rem;
}

.theme-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.storage-info,
.app-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.storage-item,
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.storage-label {
  font-weight: 500;
}

.storage-value {
  color: var(--text-primary);
  font-weight: 600;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(45deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.settings-footer {
  padding: var(--space-xl);
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface-hover);
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: var(--color-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-icon {
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
  
  .setting-control {
    margin-left: 0;
    width: 100%;
  }
  
  .theme-selector {
    width: 100%;
    justify-content: center;
  }
}
</style>
