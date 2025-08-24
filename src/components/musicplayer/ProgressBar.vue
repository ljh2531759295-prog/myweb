<template>
  <div class="progress-wrapper">
    <div
      ref="progressBarRef"
      class="progress-bar"
      :class="{ 'is-dragging': isDragging }"
      @mousedown="handleBarMouseDown"
      @mouseenter="isHovering = true"
      @mouseleave="handleMouseLeave"
      @mousemove="handleBarMouseMove"
    >
      <!-- 背景轨道 -->
      <div class="progress-track"></div>

      <!-- 已播放部分 -->
      <div
        class="progress-fill"
        :style="{ width: `${displayProgress}%` }"
      ></div>

      <!-- 拖拽滑块 -->
      <div
        class="progress-thumb"
        :class="{
          'is-visible': isHovering || isDragging,
          'is-dragging': isDragging
        }"
        :style="{ left: `${displayProgress}%` }"
        @mousedown="handleThumbMouseDown"
      ></div>

      <!-- 时间提示框 -->
      <div
        v-if="isHovering && !isDragging"
        class="time-tooltip"
        :style="{ left: `${hoverProgress}%` }"
      >
        {{ formatHoverTime(hoverProgress) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  duration: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['seek'])

// 响应式状态
const progressBarRef = ref(null)
const isHovering = ref(false)
const isDragging = ref(false)
const tempProgress = ref(0)
const hoverProgress = ref(0)

// 计算属性：显示的进度值
const displayProgress = computed(() => {
  if (isDragging.value) {
    return tempProgress.value
  }
  return Math.max(0, Math.min(100, props.progress || 0))
})

// 从鼠标事件获取位置百分比
const getProgressFromEvent = (event) => {
  if (!progressBarRef.value) return 0

  const rect = progressBarRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left

  // 确保宽度大于0，避免除零错误
  if (rect.width <= 0) return 0

  const percentage = (clickX / rect.width) * 100

  // 严格限制在0-100范围内
  return Math.max(0, Math.min(100, percentage))
}

// 处理进度条点击
const handleBarMouseDown = (event) => {
  // 如果点击的是滑块，不处理（让滑块自己处理）
  if (event.target.classList.contains('progress-thumb')) {
    return
  }

  event.preventDefault()

  const progress = getProgressFromEvent(event)
  tempProgress.value = progress
  isDragging.value = true

  // 立即跳转到点击位置
  emit('seek', progress / 100)
}

// 处理滑块拖拽开始
const handleThumbMouseDown = (event) => {
  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true
  tempProgress.value = displayProgress.value
}

// 处理进度条上的鼠标移动（悬停时显示时间提示）
const handleBarMouseMove = (event) => {
  if (!isDragging.value && isHovering.value) {
    hoverProgress.value = getProgressFromEvent(event)
    // 调试信息
    console.log('悬停位置:', hoverProgress.value, '时间:', formatHoverTime(hoverProgress.value))
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  isHovering.value = false
  hoverProgress.value = 0
}

// 处理全局鼠标移动（拖拽中）
const handleMouseMove = (event) => {
  if (!isDragging.value) return

  event.preventDefault()
  tempProgress.value = getProgressFromEvent(event)
}

// 处理鼠标释放（拖拽结束）
const handleMouseUp = (event) => {
  if (!isDragging.value) return

  event.preventDefault()

  // 发送最终的seek事件，使用拖拽过程中的最终位置
  emit('seek', tempProgress.value / 100)

  // 重置拖拽状态
  isDragging.value = false
  tempProgress.value = 0
}

// 格式化悬停时间
const formatHoverTime = (progressPercent) => {
  if (!props.duration || isNaN(props.duration)) return '0:00'

  const timeInSeconds = (progressPercent / 100) * props.duration
  const mins = Math.floor(timeInSeconds / 60)
  const secs = Math.floor(timeInSeconds % 60)

  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove, { passive: false })
  document.addEventListener('mouseup', handleMouseUp, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.progress-wrapper {
  width: 100%;
  padding: 8px 0;
  user-select: none;
  background: transparent;
}

.progress-bar {
  position: relative;
  height: 5px;
  width: 100%;
  cursor: pointer;
  border-radius: 3px;
  transition: height 0.2s ease;
  overflow: visible;
}

.progress-bar:hover {
  height: 6px;
}

.progress-bar.is-dragging {
  height: 6px;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4a90e2 0%, #357abd 100%);
  border-radius: 3px;
  transition: width 0.1s linear;
  min-width: 0;
  max-width: 100%;
  box-shadow: 0 1px 2px rgba(74, 144, 226, 0.2);
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  background: #4a90e2;
  border: 2px solid #ffffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);
  opacity: 0;
  transition: all 0.2s ease;
  cursor: grab;
  z-index: 10;
}

.progress-thumb.is-visible {
  opacity: 1;
}

.progress-thumb.is-dragging {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.3);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

.progress-thumb:hover {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 3px 8px rgba(74, 144, 226, 0.35);
}

/* 悬停时显示滑块 */
.progress-bar:hover .progress-thumb {
  opacity: 1;
}

/* 时间提示框 */
.time-tooltip {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  background: var(--tooltip-bg, rgba(0, 0, 0, 0.9));
  color: var(--tooltip-color, white);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  z-index: 20;
  margin-bottom: 10px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: tooltipFadeIn 0.2s ease;
}

/* 时间提示框箭头 */
.time-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--tooltip-bg, rgba(0, 0, 0, 0.9));
}

/* 提示框动画 */
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 拖拽时的增强视觉效果 */
.progress-bar.is-dragging .progress-fill {
  background: linear-gradient(90deg, #5ba0f2 0%, #4080cd 100%);
  box-shadow: 0 1px 4px rgba(74, 144, 226, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-wrapper {
    padding: 10px 0;
    background: transparent;
  }

  .progress-bar {
    height: 6px;
  }

  .progress-bar:hover {
    height: 7px;
  }

  .progress-thumb {
    width: 12px;
    height: 12px;
    opacity: 1; /* 移动设备上始终显示 */
  }
}

@media (max-width: 480px) {
  .progress-wrapper {
    padding: 12px 0;
    background: transparent;
  }

  .progress-bar {
    height: 7px;
  }

  .progress-thumb {
    width: 14px;
    height: 14px;
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .progress-bar,
  .progress-thumb,
  .progress-fill {
    transition: none;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .progress-track {
    background: rgba(255, 255, 255, 0.1);
  }

  .time-tooltip {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
  }

  .time-tooltip::after {
    border-top-color: rgba(255, 255, 255, 0.9);
  }
}

/* 使用CSS变量的主题适配 */
:root {
  --tooltip-bg: rgba(0, 0, 0, 0.8);
  --tooltip-color: white;
}

[data-theme="dark"] {
  --tooltip-bg: rgba(255, 255, 255, 0.9);
  --tooltip-color: #333;
}

.time-tooltip {
  background: var(--tooltip-bg);
  color: var(--tooltip-color);
}

.time-tooltip::after {
  border-top-color: var(--tooltip-bg);
}
</style>