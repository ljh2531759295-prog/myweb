<template>
  <div class="draggable-song-list">
    <div class="list-header">
      <h3>播放顺序</h3>
      <div class="header-actions">
        <button class="play-order-btn" @click="playOrder" :disabled="songs.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          顺序播放
        </button>
        <button class="play-loop-btn" @click="playLoop" :disabled="songs.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          循环播放
        </button>
        <button class="shuffle-btn" @click="shufflePlay" :disabled="songs.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
          随机播放
        </button>
      </div>
    </div>

    <div class="song-list-container">
      <div v-if="orderedSongs.length === 0" class="empty-state">
        <div class="empty-icon">🎵</div>
        <p>歌单中还没有歌曲</p>
      </div>

      <div v-else class="song-items-wrapper">
        <div class="song-items">
        <div
          v-for="(song, index) in orderedSongs"
          :key="song.id"
          class="song-item"
          :class="{
            'active': currentSong?.id === song.id,
            'playing': currentSong?.id === song.id && isPlaying,
            'dragging': draggedIndex === index,
            'drag-over': dragOverIndex === index && draggedIndex !== index
          }"
          draggable="true"
          @dragstart="handleDragStart(index, $event)"
          @dragover.prevent="handleDragOver(index, $event)"
          @dragenter.prevent="handleDragEnter(index)"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop(index, $event)"
          @dragend="handleDragEnd"
          @click="playSong(song)"
        >
          <!-- 拖拽手柄 -->
          <div class="drag-handle" title="拖拽排序">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>

          <!-- 歌曲序号 -->
          <div class="song-number">{{ index + 1 }}</div>

          <!-- 封面容器 -->
          <div class="song-cover">
            <img :src="getCoverUrl(song.cover)" :alt="song.title" />
            <div class="play-indicator" v-if="currentSong?.id === song.id && isPlaying">
              <div class="playing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <!-- 歌曲信息 -->
          <div class="song-info">
            <div class="song-title">{{ song.title }}</div>
            <div class="song-artist">{{ song.artist }}</div>
          </div>

          <!-- 歌曲时长 -->
          <div class="song-duration" v-if="song.duration">
            {{ song.duration }}
          </div>

          <!-- 收藏按钮 -->
          <div class="song-actions">
            <button class="action-btn" @click.stop="toggleFavorite(song)" :title="song.isFavorite ? '取消收藏' : '收藏'">
              <span class="heart-icon" :class="{ filled: song.isFavorite }">
                {{ song.isFavorite ? '♥' : '♡' }}
              </span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  songs: {
    type: Array,
    default: () => []
  },
  currentSong: Object,
  isPlaying: Boolean,
  getCoverUrl: Function
})

const emit = defineEmits(['play-song', 'toggle-favorite', 'remove-song', 'update-order', 'play-order', 'play-loop', 'shuffle-play'])

// 拖拽状态
const draggedIndex = ref(-1)
const dragOverIndex = ref(-1)
const draggedElement = ref(null)
const dragOffset = ref({ x: 0, y: 0 })


// 歌曲顺序
const orderedSongs = ref([])

// 监听songs变化，初始化顺序
watch(() => props.songs, (newSongs) => {
  orderedSongs.value = [...newSongs]
}, { immediate: true })

// 拖拽处理
const handleDragStart = (index, event) => {
  draggedIndex.value = index
  draggedElement.value = event.target.closest('.song-item')

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', '')

  // 设置拖拽样式
  setTimeout(() => {
    if (draggedElement.value) {
      draggedElement.value.classList.add('dragging')
    }
  }, 0)
}

const handleDragOver = (index, event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'

  if (draggedIndex.value !== -1 && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}



const handleDragEnter = (index) => {
  if (draggedIndex.value !== -1 && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const handleDragLeave = () => {
  dragOverIndex.value = -1
}



const handleDrop = (index, event) => {
  event.preventDefault()

  // 执行重排序
  if (draggedIndex.value !== -1 && draggedIndex.value !== index) {
    const newOrder = [...orderedSongs.value]
    const draggedSong = newOrder[draggedIndex.value]

    // 移除被拖拽的歌曲
    newOrder.splice(draggedIndex.value, 1)

    // 插入到新位置
    newOrder.splice(index, 0, draggedSong)

    // 更新显示顺序
    orderedSongs.value = newOrder
    emit('update-order', newOrder)
  }

  // 清理拖拽状态
  cleanupDrag()
}

const handleDragEnd = (event) => {
  cleanupDrag()
}

const cleanupDrag = () => {
  if (draggedElement.value) {
    draggedElement.value.classList.remove('dragging')
  }

  // 重置所有状态
  draggedIndex.value = -1
  dragOverIndex.value = -1
  draggedElement.value = null
}

// 播放歌曲
const playSong = (song) => {
  emit('play-song', song)
}

// 切换收藏
const toggleFavorite = (song) => {
  emit('toggle-favorite', song)
}

// 移除歌曲
const removeSong = (song) => {
  emit('remove-song', song)
}

// 顺序播放（播放完停止）
const playOrder = () => {
  emit('play-order', [...orderedSongs.value])
}

// 循环播放（播放完继续循环）
const playLoop = () => {
  emit('play-loop', [...orderedSongs.value])
}

// 随机播放（播放完继续随机）
const shufflePlay = () => {
  emit('shuffle-play', [...orderedSongs.value])
}


</script>

<style scoped>
.draggable-song-list {
  width: calc(100% + 60px);
  margin: 0 -30px;
  max-width: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 30px 16px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.play-order-btn,
.play-loop-btn,
.shuffle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-order-btn:hover,
.play-loop-btn:hover,
.shuffle-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-medium);
  transform: translateY(-1px);
}

.play-order-btn:disabled,
.play-loop-btn:disabled,
.shuffle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.song-list-container {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  max-width: none;
  padding: 0 30px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
  opacity: 0.6;
}

.song-items-wrapper {
  width: 100%;
  max-width: none;
  /* 确保与网格视图宽度一致 */
}

.song-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  width: 100%;
  max-width: none;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  min-height: 80px;
}

.song-item:hover {
  background: var(--bg-surface-hover);
  transform: translateY(-1px);
  border-color: var(--border-medium);
}

.song-item.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary-medium);
}

.song-item.playing {
  background: var(--color-primary-medium);
  border-color: var(--color-primary);
}

.song-item.dragging {
  opacity: 0.5;
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

/* 拖拽悬停效果 */
.song-item.drag-over {
  background: var(--color-primary-light);
  border-color: var(--color-primary-medium);
  transform: translateY(-1px);
  border-top: 2px solid var(--color-primary);
}



.drag-handle {
  color: var(--text-tertiary);
  cursor: grab;
  padding: 4px;
}

.drag-handle:active {
  cursor: grabbing;
}

.song-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 20px;
  text-align: center;
}

.song-cover {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.playing-animation {
  display: flex;
  gap: 2px;
  align-items: end;
}

.playing-animation span {
  width: 3px;
  background: #667eea;
  border-radius: 1px;
  animation: playing 1s ease-in-out infinite;
}

.playing-animation span:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}

.playing-animation span:nth-child(2) {
  height: 12px;
  animation-delay: 0.2s;
}

.playing-animation span:nth-child(3) {
  height: 8px;
  animation-delay: 0.4s;
}

@keyframes playing {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}



.song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.song-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.song-artist {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.song-duration {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.song-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.song-item:hover .song-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.heart-icon.filled {
  color: #ff6b6b;
}

/* 自定义滚动条 */
.song-list-container::-webkit-scrollbar {
  width: 6px;
}

.song-list-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.song-list-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.song-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .song-items {
    grid-template-columns: 1fr;
  }

  .song-item {
    gap: 16px;
    padding: 18px 22px;
  }

  .song-cover {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 768px) {
  .song-items {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .song-item {
    gap: 12px;
    padding: 14px 18px;
    min-height: 70px;
  }

  .song-cover {
    width: 50px;
    height: 50px;
  }

  .song-title {
    font-size: 14px;
  }

  .song-artist {
    font-size: 12px;
  }
}
</style>
