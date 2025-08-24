<template>
  <div class="integrated-player" @click.self="closePlayer">
    <div class="player-container">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="closePlayer">
        <i class="fas fa-times"></i>
      </button>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧：CD区域 -->
        <div class="cd-section">
          <div class="album-cover-wrapper">
            <div class="needle" :class="{ 'playing': isPlaying }"></div>
            <div class="album-cover" :class="{ 'rotating': isPlaying }">
              <img
                :src="getCoverUrl(currentSong)"
                :alt="currentSong?.title"
                @error="handleImageError"
              />
              <div class="vinyl-center"></div>
            </div>
          </div>


        </div>

        <!-- 右侧：歌词区域 -->
        <div class="lyrics-section">
          <div class="lyrics-container" ref="lyricsContainer">
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
              <div class="no-lyrics-content">
                <div class="no-lyrics-icon">🎵</div>
                <p>暂无歌词</p>
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

      <!-- 底部控制栏 -->
      <div class="bottom-controls">
        <!-- 歌曲信息 -->
        <div class="song-info-bar">
          <div class="song-cover">
            <img :src="getCoverUrl(currentSong)" :alt="currentSong?.title" @error="handleImageError" />
          </div>
          <div class="song-details">
            <div class="song-name">{{ currentSong?.title || '未知歌曲' }}</div>
            <div class="song-artist">{{ currentSong?.artist || '未知歌手' }}</div>
          </div>
          <button
            class="favorite-btn"
            :class="{ active: isFavorite }"
            @click="toggleFavorite"
            title="收藏"
          >
            <i :class="isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>
        </div>

        <!-- 中间播放控制区域 -->
        <div class="center-controls">
          <!-- 播放控制按钮 -->
          <div class="playback-controls">
            <button
              class="control-btn"
              :class="{ active: isShuffleMode }"
              @click="toggleShuffle"
              title="随机播放"
            >
              <i class="fas fa-random"></i>
            </button>

            <button class="control-btn" @click="prevSong" title="上一首">
              <i class="fas fa-step-backward"></i>
            </button>

            <button class="play-pause-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
              <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>

            <button class="control-btn" @click="nextSong" title="下一首">
              <i class="fas fa-step-forward"></i>
            </button>

            <button
              class="control-btn"
              :class="{ active: isRepeatMode }"
              @click="toggleRepeat"
              title="循环播放"
            >
              <i class="fas fa-redo"></i>
            </button>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
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

        <!-- 右侧控制 -->
        <div class="right-controls">
          <!-- 音量控制 -->
          <div class="volume-control">
            <button class="volume-btn control-btn" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
              <i :class="isMuted ? 'fas fa-volume-mute' : volume > 50 ? 'fas fa-volume-up' : 'fas fa-volume-down'"></i>
            </button>
            <input
              type="range"
              class="volume-slider"
              :value="volume"
              min="0"
              max="100"
              @input="updateVolume"
            />
          </div>

          <!-- 其他控制 -->
          <div class="extra-controls">
            <button class="control-btn" @click="$emit('edit-song', currentSong)" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="control-btn" @click="$emit('toggle-playlist')" title="播放列表">
              <i class="fas fa-list"></i>
            </button>
            <button class="control-btn" @click="hidePlayer" title="最小化">
              <i class="fas fa-minus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ProgressBar from './ProgressBar.vue'

// Props
const props = defineProps({
  currentSong: Object,
  isPlaying: Boolean,
  currentTime: Number,
  duration: Number,
  volume: Number,
  isMuted: Boolean,
  isShuffleMode: Boolean,
  isRepeatMode: Boolean,
  sidebarCollapsed: Boolean,
  favorites: Array,
  lyrics: String
})

// Emits
const emit = defineEmits([
  'toggle-play',
  'prev-song',
  'next-song',
  'seek-to',
  'seek-to-time',
  'update-volume',
  'toggle-mute',
  'toggle-shuffle',
  'toggle-repeat',
  'toggle-favorite',
  'edit-song',
  'toggle-playlist',
  'hide-player',
  'close-player'
])

// Refs
const lyricsContainer = ref(null)
const lyricsScroll = ref(null)
const currentLyricIndex = ref(-1)

// Computed
const progress = computed(() => {
  if (!props.duration) return 0
  return (props.currentTime / props.duration) * 100
})

const isFavorite = computed(() => {
  if (!props.currentSong || !props.favorites) return false
  return props.favorites.some(fav => fav.id === props.currentSong.id)
})

const hasLyrics = computed(() => {
  return props.lyrics && props.lyrics.trim().length > 0
})

const parsedLyrics = computed(() => {
  if (!hasLyrics.value) return []

  const lines = props.lyrics.split('\n')
  const parsed = []

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = match[4].trim()

      if (text) {
        parsed.push({ time, text })
      }
    }
  }

  return parsed.sort((a, b) => a.time - b.time)
})

// Methods
const getCoverUrl = (song) => {
  if (!song) return '/default-cover.jpg'
  if (song.cover && song.cover.startsWith('blob:')) {
    return song.cover
  }
  return song.cover || '/default-cover.jpg'
}

const handleImageError = (event) => {
  event.target.src = '/default-cover.jpg'
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  emit('toggle-play')
}

const prevSong = () => {
  emit('prev-song')
}

const nextSong = () => {
  emit('next-song')
}

const seekTo = (percentage) => {
  emit('seek-to', percentage)
}

const updateVolume = (event) => {
  emit('update-volume', parseInt(event.target.value))
}

const toggleMute = () => {
  emit('toggle-mute')
}

const toggleShuffle = () => {
  emit('toggle-shuffle')
}

const toggleRepeat = () => {
  emit('toggle-repeat')
}

const toggleFavorite = () => {
  if (props.currentSong) {
    emit('toggle-favorite', props.currentSong)
  }
}

const hidePlayer = () => {
  emit('hide-player')
}

const closePlayer = () => {
  emit('close-player')
}

const seekToLyric = (time) => {
  emit('seek-to-time', time)
}

// 歌词滚动逻辑
const updateCurrentLyric = () => {
  if (!hasLyrics.value || parsedLyrics.value.length === 0) {
    currentLyricIndex.value = -1
    return
  }

  let index = -1
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (props.currentTime >= parsedLyrics.value[i].time) {
      index = i
    } else {
      break
    }
  }

  if (index !== currentLyricIndex.value) {
    currentLyricIndex.value = index
    scrollToCurrentLyric()
  }
}

const scrollToCurrentLyric = async () => {
  if (!lyricsScroll.value || currentLyricIndex.value === -1) return

  await nextTick()

  const currentLine = lyricsScroll.value.querySelector(`[data-lyric-index="${currentLyricIndex.value}"]`)
  if (currentLine) {
    const container = lyricsScroll.value
    const containerHeight = container.clientHeight
    const lineTop = currentLine.offsetTop
    const lineHeight = currentLine.clientHeight

    const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2

    container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    })
  }
}

// Watchers
watch(() => props.currentTime, updateCurrentLyric)
watch(() => props.lyrics, () => {
  currentLyricIndex.value = -1
  updateCurrentLyric()
})
</script>

<style scoped>
.integrated-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

.player-container {
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  width: min(1100px, 95vw);
  height: min(650px, 90vh);
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 30px;
  gap: 30px;
  min-height: 0;
}

/* CD区域 */
.cd-section {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  width: min(40%, 350px);
  max-width: 350px;
  min-width: 250px;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.album-cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: min(280px, 80vh);
  max-height: min(280px, 80vh);
  margin-bottom: 20px;
  background: radial-gradient(circle at 30% 30%,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.3) 100%);
  border-radius: 50%;
  padding: 8px;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.1),
    0 0 0 4px rgba(0, 0, 0, 0.2),
    0 15px 40px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.album-cover {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.3),
    inset 0 0 40px rgba(0, 0, 0, 0.1),
    0 8px 25px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  background: #1a1a1a;
  aspect-ratio: 1 / 1;
}

.album-cover.rotating {
  animation: rotate 15s linear infinite;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  aspect-ratio: 1 / 1;
}

.album-cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgba(255, 255, 255, 0.02) 1deg,
      transparent 2deg
    ),
    radial-gradient(
      circle at 50% 50%,
      transparent 30%,
      rgba(0, 0, 0, 0.1) 70%,
      rgba(0, 0, 0, 0.3) 100%
    );
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.album-cover::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 10%;
  right: 10%;
  bottom: 10%;
  background: radial-gradient(
    ellipse at 30% 30%,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle,
    #1a1a1a 0%,
    #2d2d2d 30%,
    #404040 60%,
    #333 80%,
    #1a1a1a 100%);
  border-radius: 50%;
  border: 3px solid #555;
  box-shadow:
    inset 0 0 15px rgba(0, 0, 0, 0.8),
    inset 0 0 25px rgba(0, 0, 0, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.vinyl-center::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #000;
  border-radius: 50%;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.9);
}

.vinyl-center::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #111;
  border-radius: 50%;
}

.needle {
  position: absolute;
  top: -30px;
  right: 40px;
  width: 6px;
  height: 140px;
  background: linear-gradient(to bottom, #c0c0c0 0%, #888 20%, #666 50%, #333 100%);
  border-radius: 3px;
  transform-origin: top center;
  transform: rotate(-35deg);
  transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 20;
  box-shadow:
    2px 2px 8px rgba(0, 0, 0, 0.3),
    inset 1px 0 2px rgba(255, 255, 255, 0.3);
}

.needle::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #e0e0e0 0%, #999  50%, #666 100%);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.needle::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 8px;
  background: #444;
  border-radius: 0 0 50% 50%;
}

.needle.playing {
  transform: rotate(-8deg);
}



/* 歌词区域 */
.lyrics-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.lyrics-container {
  flex: 1;
  overflow: hidden;
  border-radius: 10px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.lyrics-scroll {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  /* 添加适量的上下内边距，确保第一行和最后一行也能居中 */
  padding-top: 150px;
  padding-bottom: 150px;
}

.lyric-line {
  padding: 8px 0;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  padding-left: 10px;
  margin: 2px 0;
  text-align: center;
}

.lyric-line:hover {
  background: var(--hover-bg);
  color: var(--text-color);
}

.lyric-line.current {
  color: var(--primary-color);
  font-weight: 600;
  background: var(--primary-bg);
  transform: scale(1.02);
  font-size: 1.1rem;
}

.lyric-line.passed {
  color: var(--text-muted);
}

.no-lyrics {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-lyrics-content {
  text-align: center;
  color: var(--text-secondary);
}

.no-lyrics-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.add-lyrics-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-lyrics-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

/* 底部控制栏 */
.bottom-controls {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  height: 80px;
}

/* 左侧歌曲信息 */
.song-info-bar {
  flex: 0 0 300px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.song-artist {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 24px;
}

.favorite-btn:hover {
  background: var(--hover-bg);
  color: var(--text-color);
}

.favorite-btn.active {
  color: var(--primary-color);
}

/* 中间控制区域 */
.center-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 600px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: var(--hover-bg);
  color: var(--text-color);
}

.control-btn.active {
  color: var(--primary-color);
}

.play-pause-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.play-pause-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.time-current,
.time-total {
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}

.progress-container {
  flex: 1;
}

/* 右侧控制 */
.right-controls {
  flex: 0 0 300px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-btn {
  width: 32px;
  height: 32px;
}

.volume-slider {
  width: 100px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.extra-controls {
  display: flex;
  gap: 8px;
}

.extra-controls .control-btn {
  width: 32px;
  height: 32px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes needlePlay {
  0% {
    transform: rotate(-35deg);
  }
  100% {
    transform: rotate(-8deg);
  }
}

@keyframes needlePause {
  0% {
    transform: rotate(-8deg);
  }
  20% {
    transform: rotate(-12deg);
  }
  100% {
    transform: rotate(-35deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .player-container {
    width: 95%;
    height: 90%;
  }

  .main-content {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }

  .cd-section {
    flex: none;
    padding-top: 0;
  }

  .album-cover-wrapper {
    width: 200px;
    height: 200px;
  }

  .lyrics-section {
    flex: 1;
    min-height: 200px;
  }

  .bottom-controls {
    flex-direction: column;
    height: auto;
    gap: 15px;
    padding: 15px;
  }

  .song-info-bar,
  .center-controls,
  .right-controls {
    flex: none;
    width: 100%;
  }
}

/* 响应式设计 - 针对不同屏幕尺寸 */
@media (max-width: 1200px) {
  .player-container {
    width: 95vw;
    height: 85vh;
  }

  .main-content {
    padding: 20px;
    gap: 20px;
  }

  .cd-section {
    width: min(35%, 300px);
  }
}

@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
    align-items: center;
  }

  .cd-section {
    flex: 0 0 auto;
    width: min(80%, 300px);
  }

  .lyrics-section {
    width: 100%;
    max-height: 300px;
  }
}

@media (max-width: 600px) {
  .cd-section {
    width: min(90%, 250px);
  }

  .album-cover-wrapper {
    max-width: min(220px, 70vh);
    max-height: min(220px, 70vh);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
