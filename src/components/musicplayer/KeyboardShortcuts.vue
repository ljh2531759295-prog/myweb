<template>
  <div class="shortcuts-overlay" @click="closeModal">
    <div class="shortcuts-modal" @click.stop>
      <div class="shortcuts-header">
        <h2>键盘快捷键</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="shortcuts-content">
        <div class="shortcuts-section">
          <h3>播放控制</h3>
          <div class="shortcut-list">
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>空格</kbd>
              </div>
              <div class="shortcut-desc">播放/暂停</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>K</kbd>
              </div>
              <div class="shortcut-desc">播放/暂停</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>J</kbd>
              </div>
              <div class="shortcut-desc">后退 10 秒</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>L</kbd>
              </div>
              <div class="shortcut-desc">前进 10 秒</div>
            </div>
          </div>
        </div>

        <div class="shortcuts-section">
          <h3>音量控制</h3>
          <div class="shortcut-list">
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>↑</kbd> / <kbd>↓</kbd>
              </div>
              <div class="shortcut-desc">调节音量</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>←</kbd> / <kbd>→</kbd>
              </div>
              <div class="shortcut-desc">调节音量</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>M</kbd>
              </div>
              <div class="shortcut-desc">静音/取消静音</div>
            </div>
          </div>
        </div>

        <div class="shortcuts-section">
          <h3>进度控制</h3>
          <div class="shortcut-list">
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Shift</kbd> + <kbd>←</kbd>
              </div>
              <div class="shortcut-desc">后退 10 秒</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Shift</kbd> + <kbd>→</kbd>
              </div>
              <div class="shortcut-desc">前进 10 秒</div>
            </div>
          </div>
        </div>

        <div class="shortcuts-section">
          <h3>播放速度</h3>
          <div class="shortcut-list">
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Shift</kbd> + <kbd>,</kbd>
              </div>
              <div class="shortcut-desc">减慢播放速度</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Shift</kbd> + <kbd>.</kbd>
              </div>
              <div class="shortcut-desc">加快播放速度</div>
            </div>
          </div>
        </div>

        <div class="shortcuts-section">
          <h3>其他功能</h3>
          <div class="shortcut-list">
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>Ctrl</kbd> + <kbd>F</kbd>
              </div>
              <div class="shortcut-desc">搜索音乐</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>ESC</kbd>
              </div>
              <div class="shortcut-desc">关闭搜索/模态框</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-keys">
                <kbd>?</kbd>
              </div>
              <div class="shortcut-desc">显示快捷键帮助</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.shortcuts-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.shortcuts-modal {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-light);
  animation: slideUp 0.3s ease;
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xl);
  border-bottom: 1px solid var(--border-light);
}

.shortcuts-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-xl);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.close-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.shortcuts-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
}

.shortcuts-section h3 {
  margin: 0 0 var(--space-lg) 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: 600;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: var(--space-sm);
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--bg-surface-hover);
  border-radius: var(--radius-lg);
  transition: var(--transition-fast);
}

.shortcut-item:hover {
  background: var(--color-primary-light);
  transform: translateX(4px);
}

.shortcut-keys {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.shortcut-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

kbd {
  background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-hover) 100%);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: var(--font-size-xs);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-weight: 600;
  color: var(--text-primary);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-width: 24px;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .shortcuts-content {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .shortcut-keys {
    align-self: flex-end;
  }
}
</style>
