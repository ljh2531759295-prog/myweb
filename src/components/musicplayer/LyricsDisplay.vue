<template>
  <div class="lyrics-container" :class="{ 'player-visible': showPlayer, 'sidebar-collapsed': sidebarCollapsed }">
    <div class="lyrics-header">
      <div class="lyrics-title">
        <span class="lyrics-icon">📝</span>
        <h3>歌词</h3>
        <span v-if="currentSong" class="song-info">{{ currentSong.title }} - {{ currentSong.artist }}</span>
      </div>
      <div class="lyrics-controls">
        <button
          class="lyrics-toggle-btn"
          @click="toggleLyrics"
          :title="showLyrics ? '隐藏歌词' : '显示歌词'"
        >
          <span v-if="showLyrics">🔽</span>
          <span v-else>🔼</span>
        </button>
      </div>
    </div>

    <div class="lyrics-content" v-if="showLyrics">
      <!-- 有歌词时显示 -->
      <div v-if="hasLyrics" class="lyrics-scroll" ref="lyricsScroll">
        <div
          v-for="(line, index) in parsedLyrics"
          :key="index"
          class="lyric-line"
          :class="{
            'current': currentLyricIndex === index,
            'passed': index < currentLyricIndex
          }"
          :data-lyric-index="index"
          @click="seekToLyric(line.time)"
        >
          {{ line.text }}
        </div>
      </div>

      <!-- 无歌词时显示 -->
      <div v-else class="no-lyrics">
        <div class="no-lyrics-icon">🎵</div>
        <p v-if="currentSong">《{{ currentSong.title }}》暂无歌词</p>
        <p v-else>请选择一首歌曲</p>
        <button
          v-if="currentSong"
          class="add-lyrics-btn"
          @click="$emit('edit-song', currentSong)"
        >
          添加歌词
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  currentSong: {
    type: Object,
    default: null
  },
  currentTime: {
    type: Number,
    default: 0
  },
  showPlayer: {
    type: Boolean,
    default: false
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  resourceManager: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['seek', 'seek-to-time', 'edit-song'])

const lyricsScroll = ref(null)
const parsedLyrics = ref([])
const currentLyricIndex = ref(-1)
const showLyrics = ref(true)

// 歌词内容
const lyricsContent = ref('')

// 是否有歌词
const hasLyrics = computed(() => {
  return props.currentSong?.lrcFile && parsedLyrics.value.length > 0
})

// 切换歌词显示
const toggleLyrics = () => {
  showLyrics.value = !showLyrics.value
}

// 从IndexedDB加载歌词文件
const loadLyricsFromDB = async (lrcFileName) => {
  try {
    if (!lrcFileName || !props.resourceManager) {
      return ''
    }

    const lrcBlob = await props.resourceManager.getFileBlob('lyrics', lrcFileName)
    if (lrcBlob) {
      return await lrcBlob.text()
    }
    return ''
  } catch (error) {
    console.error('加载歌词文件失败:', error)
    return ''
  }
}

// 解析LRC歌词
const parseLRC = (lrcText) => {
  if (!lrcText) return []

  const lines = lrcText.split('\n')
  const lyrics = []

  lines.forEach((line) => {
    // 清理行内容，移除回车符
    const cleanLine = line.replace(/\r/g, '').trim()

    // 匹配时间标签 [mm:ss:xx] 或 [mm:ss.xx] 或 [mm:ss]
    const match = cleanLine.match(/\[(\d{2}):(\d{2}):(\d{2})\](.*)/) || cleanLine.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/)
    if (match) {
      let minutes, seconds, milliseconds, text

      if (match[0].includes(':') && match[3] && !match[3].includes('.')) {
        // [mm:ss:xx] 格式，第三个数字是毫秒的十位
        minutes = parseInt(match[1])
        seconds = parseInt(match[2])
        milliseconds = parseInt(match[3]) * 10 // 转换为毫秒
        text = match[4].trim()
      } else {
        // [mm:ss.xx] 或 [mm:ss] 格式
        minutes = parseInt(match[1])
        seconds = parseInt(match[2])
        milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0
        text = match[4].trim()
      }

      const time = minutes * 60 + seconds + milliseconds / 1000

      if (text) { // 只添加有文本的行
        lyrics.push({ time, text })
      }
    }
  })

  return lyrics.sort((a, b) => a.time - b.time)
}

// 根据当前时间找到对应的歌词行
const findCurrentLyricIndex = (currentTime) => {
  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (currentTime >= parsedLyrics.value[i].time) {
      return i
    }
  }
  return -1
}

// 滚动到当前歌词 - 精确居中
const scrollToCurrentLyric = async (index) => {
  if (!lyricsScroll.value || index < 0 || !parsedLyrics.value.length) return

  await nextTick()

  const currentLine = lyricsScroll.value.querySelector(`[data-lyric-index="${index}"]`)
  if (currentLine && lyricsScroll.value) {
    const container = lyricsScroll.value
    const containerHeight = container.clientHeight

    // 获取元素相对于滚动容器的位置
    const lineTopInContainer = currentLine.offsetTop
    const lineHeight = currentLine.clientHeight

    // 计算目标滚动位置：让当前行位于容器的中心
    const targetScrollTop = lineTopInContainer - (containerHeight / 2) + (lineHeight / 2)

    // 检查是否需要滚动（避免不必要的滚动）
    const currentScrollTop = container.scrollTop
    const scrollDifference = Math.abs(currentScrollTop - targetScrollTop)

    // 只有当滚动差异大于10px时才进行滚动
    if (scrollDifference > 10) {
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })
    }
  }
}

// 点击歌词跳转到对应时间
const seekToLyric = (time) => {
  emit('seek-to-time', time)
}

// 监听歌曲变化，加载歌词
watch(() => props.currentSong?.lrcFile, async (newLrcFile) => {
  if (newLrcFile) {
    lyricsContent.value = await loadLyricsFromDB(newLrcFile)
    parsedLyrics.value = parseLRC(lyricsContent.value)
  } else {
    lyricsContent.value = ''
    parsedLyrics.value = []
  }
  currentLyricIndex.value = -1

  // 重置滚动位置到顶部
  await nextTick()
  if (lyricsScroll.value) {
    lyricsScroll.value.scrollTop = 0
  }
}, { immediate: true })

// 监听播放时间变化
watch(() => props.currentTime, (newTime) => {
  if (!hasLyrics.value) return

  const newIndex = findCurrentLyricIndex(newTime)
  if (newIndex !== currentLyricIndex.value) {
    currentLyricIndex.value = newIndex
    scrollToCurrentLyric(newIndex)
  }
})

// 监听歌曲变化，重置状态
watch(() => props.currentSong, () => {
  currentLyricIndex.value = -1
  if (lyricsScroll.value) {
    lyricsScroll.value.scrollTop = 0
  }
})
</script>

<style scoped>
.lyrics-container {
  position: fixed;
  bottom: 0;
  left: 280px;
  right: 0;
  height: 200px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-light);
  z-index: 50;
  transition: all 0.3s ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.lyrics-container.player-visible {
  bottom: 90px; /* 播放器高度 */
}

.lyrics-container.sidebar-collapsed {
  left: 0;
}

.lyrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-surface-hover);
  flex-shrink: 0;
}

.lyrics-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lyrics-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.lyrics-icon {
  font-size: 16px;
}

.song-info {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 8px;
}

.lyrics-toggle-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.lyrics-toggle-btn:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.lyrics-content {
  flex: 1;
  overflow: hidden;
}

.no-lyrics {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
  padding: var(--space-xl);
}

.no-lyrics-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.6;
}

.no-lyrics h3 {
  margin: 0 0 var(--space-md) 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.no-lyrics p {
  margin: 8px 0;
  font-size: 14px;
}

.add-lyrics-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.add-lyrics-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.lyrics-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.lyrics-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  text-align: center;
  background: var(--bg-surface-hover);
}

.lyrics-header h3 {
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.lyrics-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.lyrics-scroll {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl) var(--space-lg);
  scroll-behavior: smooth;
  /* 添加适量的上下内边距，确保第一行和最后一行也能居中 */
  padding-top: 150px;
  padding-bottom: 150px;
}

.lyric-line {
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--text-secondary);
  text-align: center;
  min-height: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lyric-line:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.lyric-line.current {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
  font-size: var(--font-size-lg);
  transform: scale(1.02);
  box-shadow: 0 2px 8px var(--color-primary-light);
}

.lyric-line.passed {
  color: var(--text-tertiary);
  opacity: 0.7;
}

/* 自定义滚动条 */
.lyrics-scroll::-webkit-scrollbar {
  width: 6px;
}

.lyrics-scroll::-webkit-scrollbar-track {
  background: var(--bg-surface-hover);
  border-radius: 3px;
}

.lyrics-scroll::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 3px;
}

.lyrics-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lyrics-container {
    left: 240px;
  }

  .lyrics-container.sidebar-collapsed {
    left: 0;
  }

  .lyrics-header {
    padding: var(--space-md);
  }

  .lyrics-scroll {
    padding: var(--space-lg) var(--space-md);
  }

  .lyric-line {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-sm);
  }

  .lyric-line.current {
    font-size: var(--font-size-md);
  }
}

@media (max-width: 480px) {
  .lyrics-container {
    left: 200px;
    height: 150px;
  }

  .lyrics-container.player-visible {
    bottom: 80px;
  }

  .song-info {
    display: none;
  }
}
</style>
