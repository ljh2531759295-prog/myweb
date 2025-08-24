<template>
  <div class="audio-player" v-if="currentSong">
    <!-- 左侧：歌曲信息 -->
    <div class="player-info">
      <img :src="getCoverUrl(currentSong.cover)" class="cover" alt="专辑封面" />
      <div class="song-details">
        <h3 class="song-title">{{ currentSong.title }}</h3>
        <p class="song-artist">{{ currentSong.artist }}</p>
      </div>
      <button class="favorite-btn" @click="toggleFavorite" :class="{ active: currentSong.isFavorite }">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>

    <!-- 中间：播放控制 -->
    <div class="player-controls">
      <!-- 控制按钮 -->
      <div class="control-buttons">
        <button class="control-btn prev-btn" @click="prevSong" title="上一首">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        <button class="play-pause-btn" @click="togglePlay" title="播放/暂停">
          <svg v-if="!isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <button class="control-btn next-btn" @click="nextSong" title="下一首">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      <!-- 进度条区域 -->
      <div class="progress-area">
        <span class="time-current">{{ formatTime(currentTime) }}</span>
        <div class="progress-container">
          <ProgressBar
            :progress="progress"
            :duration="duration"
            @seek="seekTo"
            class="progress-bar"
          />
        </div>
        <span class="time-total">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 右侧：音量和其他控制 -->
    <div class="player-extras">
      <button class="control-btn playlist-btn" @click="togglePlaylist" title="播放列表">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
      </button>

      <div class="volume-control">
        <button class="volume-btn" @click="toggleMute" title="静音">
          <svg v-if="volume > 50" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <svg v-else-if="volume > 0" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="100"
          :value="volume"
          @input="updateVolume"
          class="volume-slider"
          title="音量"
        />
      </div>

      <!-- 播放速度控制 -->
      <div class="speed-control">
        <button class="control-btn speed-btn" :title="`播放速度: ${playbackRate}x`">
          <span class="speed-text">{{ playbackRate }}x</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="speed-arrow">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
          </svg>
        </button>
        <div class="speed-menu">
          <div class="speed-menu-header">播放速度</div>
          <div class="speed-options">
            <button
              v-for="rate in playbackRates"
              :key="rate"
              class="speed-option"
              :class="{ active: playbackRate === rate }"
              @click="setPlaybackRate(rate)"
            >
              {{ rate }}x
            </button>
          </div>
        </div>
      </div>

      <button class="control-btn fullscreen-btn" @click="toggleFullscreen" title="全屏">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      </button>

      <button class="control-btn hide-player-btn" @click="hidePlayer" title="隐藏播放栏">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      <button class="control-btn close-player-btn" @click="closePlayer" title="关闭播放器">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProgressBar from './ProgressBar.vue'

const props = defineProps({
  currentSong: Object,
  isPlaying: Boolean,
  currentTime: Number,
  duration: Number,
  volume: Number,
  getCoverUrl: Function,
  playbackRate: {
    type: Number,
    default: 1
  }
})

// 计算进度百分比
const progress = computed(() => {
  return props.duration ? (props.currentTime / props.duration) * 100 : 0
})

const emit = defineEmits([
  'play-song',
  'toggle-play',
  'next-song',
  'prev-song',
  'seek',
  'update-volume',
  'toggle-favorite',
  'toggle-playlist',
  'toggle-fullscreen',
  'toggle-mute',
  'hide-player',
  'close-player',
  'set-playback-rate'
])

// 获取封面资源URL
const getCoverUrl = (cover) => {
  // 如果父组件提供了getCoverUrl函数，使用它
  if (props.getCoverUrl) {
    return props.getCoverUrl(cover)
  }
  // 否则使用默认的assets路径
  if (!cover) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwNSAxNjBDMTMyLjYxNCAxNjAgMTYwIDEzMi42MTQgMTYwIDEwNUMxNjAgNzcuMzg1OCAxMzIuNjE0IDUwIDEwNSA1MEgxMDBWNTBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMTA1IiBjeT0iMTA1IiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPgo='
  }
  return new URL(`/src/assets/music/covers/${cover}`, import.meta.url).href
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// 控制方法
const togglePlay = () => emit('toggle-play')
const nextSong = () => emit('next-song')
const prevSong = () => emit('prev-song')
const seekTo = (pos) => emit('seek', pos)
const updateVolume = (event) => emit('update-volume', event.target.value)
const toggleFavorite = () => emit('toggle-favorite')
const togglePlaylist = () => emit('toggle-playlist')
const toggleFullscreen = () => emit('toggle-fullscreen')
const toggleMute = () => emit('toggle-mute')
const hidePlayer = () => emit('hide-player')
const closePlayer = () => emit('close-player')

// 播放速度选项
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

// 设置播放速度
const setPlaybackRate = (rate) => {
  emit('set-playback-rate', rate)
}
</script>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: var(--bg-sidebar);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: var(--shadow-heavy);
}


/* 左侧：歌曲信息 */
.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 350px;
}

.cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.song-details {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.song-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.song-artist {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.favorite-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.favorite-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
}

.favorite-btn.active {
  color: #ef4444;
}

/* 中间：播放控制 */
.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 600px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
  transform: scale(1.1);
}

.control-btn.active {
  color: var(--color-primary);
}

/* 播放速度控制 */
.speed-control {
  position: relative;
  display: inline-block;
}

.speed-btn {
  min-width: 60px;
  height: 36px;
  font-weight: 600;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-hover) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 var(--space-md);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.speed-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.speed-btn:hover::before {
  left: 100%;
}

.speed-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-medium) 100%);
  box-shadow:
    0 4px 16px var(--color-primary-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.speed-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.speed-arrow {
  width: 10px;
  height: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.8;
  color: var(--text-secondary);
}

.speed-control:hover .speed-arrow {
  transform: translateY(-2px) scale(1.1);
  color: var(--text-primary);
}

.speed-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  padding: 16px;
  margin-bottom: 12px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  min-width: 140px;
}

[data-theme="dark"] .speed-menu {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.speed-control:hover .speed-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-8px);
}

.speed-menu::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.95);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

[data-theme="dark"] .speed-menu::after {
  border-top-color: rgba(30, 30, 30, 0.95);
}

.speed-menu-header {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-tertiary);
  text-align: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

[data-theme="dark"] .speed-menu-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.speed-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.speed-option {
  background: rgba(0, 0, 0, 0.03);
  border: none;
  border-radius: 10px;
  padding: 10px 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .speed-option {
  background: rgba(255, 255, 255, 0.05);
}

.speed-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.speed-option:hover::before {
  left: 100%;
}

.speed-option:hover {
  background: rgba(102, 126, 234, 0.1);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.speed-option.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, #5a67d8 100%);
  color: white;
  box-shadow:
    0 4px 16px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.speed-option.active:hover {
  background: linear-gradient(135deg, var(--color-primary) 0%, #5a67d8 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow:
    0 6px 20px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.play-pause-btn {
  background: var(--color-gradient);
  color: var(--text-primary);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.play-pause-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.progress-area {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 500px;
}

.time-current,
.time-total {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
  min-width: 40px;
  text-align: center;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

.progress-container {
  flex: 1;
}

.progress-bar {
  width: 100%;
}

/* 右侧：音量和其他控制 */
.player-extras {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 280px;
  justify-content: flex-end;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.volume-control:hover {
  background: var(--bg-surface);
}

.volume-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
}

.volume-slider {
  width: 100px;
  height: 3px;
  background: var(--border-light);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  transition: height 0.2s ease;
}

.volume-slider:hover {
  height: 4px;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: 2px solid #ffffff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.25);
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
  box-shadow: 0 3px 10px rgba(74, 144, 226, 0.4);
}

.volume-slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: 2px solid #ffffff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.25);
  transition: all 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.3);
  box-shadow: 0 3px 10px rgba(74, 144, 226, 0.4);
}

/* 音量滑块轨道样式 */
.volume-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}

.volume-slider::-moz-range-track {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  border: none;
}

/* 音量按钮样式改进 */
.volume-btn {
  transition: all 0.2s ease;
  border-radius: 6px;
  padding: 6px;
}

.volume-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.hide-player-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.hide-player-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-medium);
  transform: translateY(1px);
}

.hide-player-btn svg {
  transition: transform 0.2s ease;
}

.hide-player-btn:hover svg {
  transform: translateY(2px);
}

/* 关闭播放器按钮样式 */
.close-player-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  transition: all 0.2s ease;
  margin-left: 8px;
}

.close-player-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.close-player-btn svg {
  color: white;
  transition: transform 0.2s ease;
}

.close-player-btn:hover svg {
  transform: rotate(90deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-player {
    padding: 0 16px;
  }

  .player-info {
    min-width: 200px;
    max-width: 250px;
  }

  .control-buttons {
    gap: 12px;
  }

  .player-extras {
    min-width: 200px;
  }

  .volume-slider {
    width: 80px;
    height: 4px;
  }

  .volume-control {
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .audio-player {
    height: 80px;
    padding: 0 12px;
  }

  .cover {
    width: 48px;
    height: 48px;
  }

  .song-title {
    font-size: 14px;
  }

  .song-artist {
    font-size: 12px;
  }

  .play-pause-btn {
    width: 40px;
    height: 40px;
  }

  .control-buttons {
    gap: 8px;
  }

  .progress-area {
    gap: 8px;
  }

  .player-extras {
    gap: 12px;
  }

  .volume-slider {
    width: 60px;
    height: 5px;
  }

  .volume-control {
    gap: 8px;
  }

  .volume-btn {
    padding: 4px;
  }

  .speed-btn {
    padding: 4px 8px;
  }

  .speed-text {
    font-size: 12px;
  }
}
</style>