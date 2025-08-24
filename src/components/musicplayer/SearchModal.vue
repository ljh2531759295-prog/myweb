<template>
  <div class="search-modal-overlay" @click="closeModal">
    <div class="search-modal" @click.stop>
      <div class="search-header">
        <h2>搜索音乐</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="search-input-container">
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="搜索歌曲、艺术家或专辑..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="search-results">
        <div v-if="!searchQuery" class="search-tips">
          <div class="tips-icon">🔍</div>
          <h3>开始搜索</h3>
          <p>输入歌曲名、艺术家或专辑名来搜索音乐</p>
          <div class="search-shortcuts">
            <div class="shortcut">
              <kbd>Ctrl</kbd> + <kbd>F</kbd> 打开搜索
            </div>
            <div class="shortcut">
              <kbd>ESC</kbd> 关闭搜索
            </div>
          </div>
        </div>

        <div v-else-if="searchResults.length === 0" class="no-results">
          <div class="no-results-icon">😔</div>
          <h3>没有找到结果</h3>
          <p>尝试使用不同的关键词搜索</p>
        </div>

        <div v-else class="results-list">
          <div class="results-header">
            <h3>搜索结果 ({{ searchResults.length }})</h3>
          </div>
          <div class="song-list">
            <div
              v-for="song in searchResults"
              :key="song.id"
              class="song-item"
              :class="{ 
                'playing': currentSong?.id === song.id && isPlaying,
                'current': currentSong?.id === song.id
              }"
              @click="playSong(song)"
            >
              <div class="song-cover">
                <img :src="getCoverUrl(song.cover)" alt="封面" />
                <div class="play-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="song-info">
                <div class="song-title" v-html="highlightText(song.title, searchQuery)"></div>
                <div class="song-artist" v-html="highlightText(song.artist, searchQuery)"></div>
              </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  searchQuery: String,
  searchResults: Array,
  currentSong: Object,
  isPlaying: Boolean,
  getCoverUrl: Function
})

const emit = defineEmits(['close', 'search', 'clear-search', 'play-song', 'toggle-favorite'])

const searchInput = ref(null)
const searchQuery = ref(props.searchQuery || '')

// 处理搜索输入
const handleSearch = () => {
  emit('search', searchQuery.value)
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  emit('clear-search')
}

// 关闭模态框
const closeModal = () => {
  emit('close')
}

// 播放歌曲
const playSong = (song) => {
  emit('play-song', song)
  closeModal()
}

// 切换收藏
const toggleFavorite = (song) => {
  emit('toggle-favorite', song)
}

// 高亮搜索文本
const highlightText = (text, query) => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 组件挂载时聚焦搜索框
onMounted(() => {
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
})
</script>

<style scoped>
.search-modal-overlay {
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

.search-modal {
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

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xl);
  border-bottom: 1px solid var(--border-light);
}

.search-header h2 {
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

.search-input-container {
  position: relative;
  padding: var(--space-xl);
  border-bottom: 1px solid var(--border-light);
}

.search-input {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  transition: var(--transition-normal);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
  outline: none;
}

.clear-btn {
  position: absolute;
  right: calc(var(--space-xl) + var(--space-md));
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.clear-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
}

.search-tips {
  text-align: center;
  padding: var(--space-3xl) var(--space-xl);
  color: var(--text-secondary);
}

.tips-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.6;
}

.search-tips h3 {
  margin: 0 0 var(--space-md) 0;
  color: var(--text-primary);
}

.search-shortcuts {
  margin-top: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.shortcut {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

kbd {
  background: var(--bg-surface-hover);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: var(--font-size-xs);
  font-family: monospace;
}

.no-results {
  text-align: center;
  padding: var(--space-3xl) var(--space-xl);
  color: var(--text-secondary);
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.6;
}

.no-results h3 {
  margin: 0 0 var(--space-md) 0;
  color: var(--text-primary);
}

.results-header {
  margin-bottom: var(--space-lg);
}

.results-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.song-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  border: 1px solid transparent;
}

.song-item:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-medium);
}

.song-item.current {
  background: var(--color-primary-light);
  border-color: var(--color-primary-medium);
}

.song-item.playing {
  background: var(--color-primary-medium);
  border-color: var(--color-primary);
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition-fast);
  color: white;
}

.song-item:hover .play-overlay {
  opacity: 1;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-actions {
  display: flex;
  gap: var(--space-sm);
  opacity: 0;
  transition: var(--transition-fast);
}

.song-item:hover .song-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.heart-icon.filled {
  color: #ef4444;
}

:deep(mark) {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 0 2px;
  border-radius: 2px;
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
</style>
