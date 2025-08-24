<template>
  <div class="playlist-song-grid-container">
    <!-- 控制按钮区域 -->
    <div class="list-header">
      <h3>音乐库</h3>
      <div class="header-actions">
        <button class="play-order-btn" @click="playOrder" :disabled="playlist.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          顺序播放
        </button>
        <button class="play-loop-btn" @click="playLoop" :disabled="playlist.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          循环播放
        </button>
        <button class="shuffle-btn" @click="shufflePlay" :disabled="playlist.length === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
          随机播放
        </button>
      </div>
    </div>

    <!-- 歌曲网格 -->
    <div v-if="playlist.length > 0" class="song-grid">
      <div
        v-for="song in playlist"
        :key="song.id"
        class="song-card"
        :class="{
          'playing': currentSong && currentSong.id === song.id && isPlaying,
          'is-favorite': song.isFavorite
        }"
        @click="playSong(song)"
        @contextmenu.prevent="showContextMenu($event, song)"
      >
        <!-- 封面图片 -->
        <div class="cover-container">
          <img
            :src="getCoverUrl(song.cover)"
            class="cover"
            :class="{
              'cd-spinning': currentSong?.id === song.id && isPlaying,
              'cd-round': currentSong?.id === song.id && isPlaying
            }"
          />
          <div class="play-overlay" :class="{ hidden: currentSong?.id === song.id && isPlaying }">
            <div class="play-button">▶</div>
          </div>
        </div>

        <!-- 歌曲信息 -->
        <div class="song-info">
          <h4 class="song-title">{{ song.title }}</h4>
          <p class="song-artist">{{ song.artist }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎵</div>
      <p>暂无歌曲</p>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :song="contextMenu.song"
      :playlists="playlists"
      @delete-song="handleDeleteSong"
      @add-to-playlist="handleAddToPlaylist"
      @close="closeContextMenu"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ContextMenu from './ContextMenu.vue'

const props = defineProps({
  playlist: {
    type: Array,
    default: () => []
  },
  currentSong: Object,
  isPlaying: Boolean,
  getCoverUrl: Function,
  playlists: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['play-song', 'delete-song', 'add-to-playlist', 'play-order', 'play-loop', 'shuffle-play'])

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  position: { x: 0, y: 0 },
  song: null
})

const playSong = (song) => {
  emit('play-song', song)
}



// 右键菜单处理
const showContextMenu = (event, song) => {
  contextMenu.value = {
    visible: true,
    position: {
      x: event.clientX,
      y: event.clientY
    },
    song: song
  }
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

const handleDeleteSong = (song) => {
  emit('delete-song', song)
  closeContextMenu()
}

const handleAddToPlaylist = (song, playlist) => {
  emit('add-to-playlist', song, playlist)
  closeContextMenu()
}

// 顺序播放（播放完停止）
const playOrder = () => {
  emit('play-order', [...props.playlist])
}

// 循环播放（播放完继续循环）
const playLoop = () => {
  emit('play-loop', [...props.playlist])
}

// 随机播放（播放完继续随机）
const shufflePlay = () => {
  emit('shuffle-play', [...props.playlist])
}

// 全局点击监听器，用于关闭右键菜单
const handleGlobalClick = () => {
  if (contextMenu.value.visible) {
    closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.playlist-song-grid-container {
  width: calc(100% + 60px);
  margin: 0 -30px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 头部控制区域 */
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
  transform: translateY(-1px);
  border-color: var(--border-medium);
}

.play-order-btn:disabled,
.play-loop-btn:disabled,
.shuffle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 网格容器样式 */
.song-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding: 0 30px;
  min-width: 0;
}

/* 自定义滚动条 */
.song-grid::-webkit-scrollbar {
  width: 8px;
}

.song-grid::-webkit-scrollbar-track {
  background: var(--bg-surface);
  border-radius: 4px;
}

.song-grid::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 4px;
}

.song-grid::-webkit-scrollbar-thumb:hover {
  background: var(--border-secondary);
}

/* 歌曲卡片样式 */
.song-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.song-card:hover {
  background: var(--bg-surface-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-medium);
}

.song-card.playing {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--color-primary-light);
}

/* 封面容器样式 */
.cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: var(--space-md);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

/* 播放时的CD机背景 */
.song-card.playing .cover-container {
  background: radial-gradient(circle,
    #1a1a1a 0%,
    #2d2d2d 30%,
    #404040 60%,
    #333 80%,
    #1a1a1a 100%);
  border-radius: 50%;
  padding: var(--space-md);
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.8),
    inset 0 0 40px rgba(0, 0, 0, 0.6),
    0 4px 20px rgba(0, 0, 0, 0.4);
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-normal);
}

.song-card:hover .cover:not(.cd-spinning) {
  transform: scale(1.05);
}

/* CD旋转动画 */
.cd-spinning {
  animation: spin 8s linear infinite;
  border-radius: 50%;
  border: 4px solid var(--color-primary);
  box-shadow:
    0 0 0 8px rgba(102, 126, 234, 0.2),
    0 0 0 16px rgba(102, 126, 234, 0.1),
    0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
}

/* CD机指针 - 简单小三角 */
.cover-container::after {
  content: '';
  position: absolute;
  top: 20%;
  right: -5px;
  width: 0;
  height: 0;
  border-left: 8px solid #666;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 5;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
}

/* 播放时显示指针 */
.song-card.playing .cover-container::after {
  opacity: 1;
}

/* CD中心孔效果 */
.cd-spinning::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background: #1a1a1a;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  box-shadow:
    inset 0 0 8px rgba(0, 0, 0, 0.8),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 旋转动画关键帧 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 播放覆盖层 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition-normal);
  border-radius: var(--radius-lg);
  z-index: 1;
}

.song-card:hover .play-overlay:not(.hidden) {
  opacity: 1;
}

.play-overlay.hidden {
  opacity: 0 !important;
  pointer-events: none;
}

.play-button {
  color: var(--text-primary);
  font-size: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}



/* 歌曲信息 */
.song-info {
  text-align: left;
  background: transparent !important;
  padding: var(--space-sm);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.song-title {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-tertiary);
  padding: 0 var(--space-3xl);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .song-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }
}

@media (max-width: 900px) {
  .song-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .song-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .song-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}


</style>
