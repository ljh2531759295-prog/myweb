<template>
  <div class="full-player-overlay" @click="$emit('close')">
    <div class="full-player-container" @click.stop>
      <!-- 顶部标题栏 -->
      <div class="player-header">
        <button class="back-btn" @click="$emit('close')" title="返回">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        
        <div class="song-info-header">
          <h2 class="song-title">{{ currentSong?.title || '未知歌曲' }}</h2>
          <p class="song-artist">{{ currentSong?.artist || '未知艺术家' }}</p>
        </div>

        <div class="header-actions">
          <button class="action-btn" @click="toggleFavorite" :class="{ 'active': isFavorite }" title="收藏">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button class="action-btn" @click="$emit('edit-song', currentSong)" title="编辑">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 主要内容区域：上半部分CD和歌词 -->
      <div class="player-main">
        <!-- 左侧：CD区域 -->
        <div class="cd-area">
          <div class="cd-container">
            <div class="cd-disc" :class="{ 'spinning': isPlaying }">
              <img
                :src="getCoverUrl(currentSong)"
                :alt="currentSong?.title"
                @error="handleImageError"
              />
              <div class="cd-center"></div>
            </div>
          </div>
        </div>

        <!-- 右侧：歌词区域 -->
        <div class="lyrics-area">
          <div class="lyrics-container">
            <div class="lyrics-header">
              <h3>歌词</h3>
              <button class="lyrics-btn" @click="$emit('edit-song', currentSong)" v-if="currentSong" title="编辑歌词">
                编辑
              </button>
            </div>
            <div class="lyrics-content">
              <div class="no-lyrics">
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
        </div>
      </div>

      <!-- 底部控制条 -->
      <div class="player-controls">
        <!-- 播放控制按钮 -->
        <div class="control-buttons">
          <button class="ctrl-btn" @click="toggleShuffle" :class="{ 'active': isShuffleMode }" title="随机播放">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>

          <button class="ctrl-btn" @click="prevSong" title="上一首">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button class="play-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
            <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <button class="ctrl-btn" @click="nextSong" title="下一首">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          <button class="ctrl-btn" @click="toggleRepeat" :class="{ 'active': isRepeatMode }" title="循环播放">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>

        <!-- 进度条区域 -->
        <div class="progress-area">
          <span class="time-display">{{ formatTime(currentTime) }}</span>
          <div class="progress-wrapper">
            <ProgressBar
              :progress="progress"
              :duration="duration"
              @seek="seekTo"
            />
          </div>
          <span class="time-display">{{ formatTime(duration) }}</span>
        </div>

        <!-- 音量控制 -->
        <div class="volume-area">
          <button class="ctrl-btn" @click="toggleMute" title="静音">
            <svg v-if="!isMuted && volume > 50" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <svg v-else-if="!isMuted && volume > 0" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="100"
            :value="isMuted ? 0 : volume"
            @input="updateVolume"
            class="volume-slider"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  currentSong: { type: Object, default: null },
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  volume: { type: Number, default: 100 },
  isMuted: { type: Boolean, default: false },
  isShuffleMode: { type: Boolean, default: false },
  isRepeatMode: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  sidebarCollapsed: { type: Boolean, default: false },
  getCoverUrl: { type: Function, required: true },
  resourceManager: { type: Object, required: true }
})

const emit = defineEmits([
  'close', 'toggle-play', 'next-song', 'prev-song', 'seek',
  'update-volume', 'toggle-favorite', 'toggle-shuffle',
  'toggle-repeat', 'toggle-mute', 'edit-song'
])

// 计算进度百分比
const progress = computed(() => {
  return props.duration ? (props.currentTime / props.duration) * 100 : 0
})

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = '/src/assets/music/covers/default.jpg'
}

// 控制方法
const togglePlay = () => emit('toggle-play')
const nextSong = () => emit('next-song')
const prevSong = () => emit('prev-song')
const seekTo = (pos) => emit('seek', pos)
const updateVolume = (event) => emit('update-volume', event.target.value)
const toggleFavorite = () => emit('toggle-favorite')
const toggleShuffle = () => emit('toggle-shuffle')
const toggleRepeat = () => emit('toggle-repeat')
const toggleMute = () => emit('toggle-mute')
</script>

<style scoped>
/* 全屏播放器覆盖层 */
.full-player-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

/* 播放器容器 */
.full-player-container {
  width: 90vw;
  max-width: 1200px;
  height: 85vh;
  max-height: 800px;
  background: var(--bg-surface);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

/* 顶部标题栏 */
.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: var(--bg-overlay);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.song-info-header {
  flex: 1;
  text-align: center;
  margin: 0 24px;
}

.song-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.song-artist {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.action-btn.active {
  color: var(--color-primary);
}

/* 主要内容区域：上半部分CD和歌词 */
.player-main {
  flex: 1;
  display: flex;
  padding: 40px;
  gap: 60px;
  min-height: 0;
  overflow: hidden;
}

/* CD区域 - 左侧偏上方 */
.cd-area {
  flex: 0 0 400px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20px;
}

.cd-container {
  position: relative;
  width: 320px;
  height: 320px;
}

.cd-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: linear-gradient(45deg, #333, #666);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.cd-disc.spinning {
  animation: spin 25s linear infinite;
}

.cd-disc img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.cd-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #333 30%, #666 70%);
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 歌词区域 - 右侧对称 */
.lyrics-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.lyrics-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 0;
}

.lyrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.lyrics-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.lyrics-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lyrics-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.lyrics-content {
  flex: 1;
  min-height: 0;
}

.no-lyrics {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--text-tertiary);
}

.no-lyrics-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-lyrics p {
  font-size: 16px;
  margin: 8px 0;
}

.add-lyrics-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s ease;
}

.add-lyrics-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* 底部控制条 */
.player-controls {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 24px 40px;
  background: var(--bg-overlay);
  border-top: 1px solid var(--border-light);
}

/* 控制按钮 */
.control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ctrl-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: scale(1.1);
}

.ctrl-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.play-btn {
  background: var(--color-gradient);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

/* 进度条区域 */
.progress-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 500px;
}

.time-display {
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
  min-width: 45px;
  text-align: center;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.progress-wrapper {
  flex: 1;
}

/* 音量控制 */
.volume-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-slider {
  width: 100px;
  height: 4px;
  background: var(--border-light);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .player-main {
    flex-direction: column;
    gap: 30px;
  }

  .cd-area {
    flex: none;
    align-items: center;
    padding-top: 0;
  }

  .player-controls {
    flex-direction: column;
    gap: 20px;
  }

  .progress-area {
    max-width: none;
    order: 1;
  }

  .control-buttons {
    order: 2;
  }

  .volume-area {
    order: 3;
  }
}

@media (max-width: 768px) {
  .full-player-container {
    width: 95vw;
    height: 90vh;
  }

  .player-main {
    padding: 20px;
  }

  .cd-container {
    width: 250px;
    height: 250px;
  }

  .player-controls {
    padding: 16px 20px;
  }

  .control-buttons {
    gap: 12px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
  }
}
</style>
