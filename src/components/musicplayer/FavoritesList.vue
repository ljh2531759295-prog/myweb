<template>
  <div class="favorites-container">
    <div class="content-header">
      <div class="header-title">
        <span class="title-icon">❤️</span>
        <h1>我喜欢的</h1>
      </div>
      <div class="header-info">
        <span class="song-count">{{ favoriteCount }} 首歌曲</span>
      </div>
    </div>

    <div class="content-body">
      <div v-if="favoriteCount === 0" class="empty-state">
        <div class="empty-icon">💔</div>
        <h3 class="empty-title">还没有收藏的歌曲</h3>
        <p class="empty-description">点击歌曲卡片右上角的爱心来收藏你喜欢的音乐</p>
        <button class="back-to-library-btn" @click="$emit('navigate', 'library')">
          <span class="btn-icon">🎶</span>
          返回音乐库
        </button>
      </div>

      <div v-else class="favorites-grid">
        <SongList
          :playlist="favoriteSongs"
          :current-song="currentSong"
          :is-playing="isPlaying"
          :get-cover-url="getCoverUrl"
          :playlists="playlists"
          @play-song="$emit('play-song', $event)"
          @toggle-favorite="$emit('toggle-favorite', $event)"
          @delete-song="$emit('delete-song', $event)"
          @add-to-playlist="(song, playlist) => $emit('add-to-playlist', song, playlist)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SongList from './SongList.vue'

const props = defineProps({
  playlist: Array,
  currentSong: Object,
  isPlaying: Boolean,
  getCoverUrl: Function,
  playlists: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['play-song', 'toggle-favorite', 'navigate', 'delete-song', 'add-to-playlist'])

// 计算收藏的歌曲
const favoriteSongs = computed(() => {
  return props.playlist.filter(song => song.isFavorite)
})

// 收藏歌曲数量
const favoriteCount = computed(() => {
  return favoriteSongs.value.length
})
</script>

<style scoped>
.favorites-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 头部样式 - 与我的音乐页面保持一致 */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.content-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.8);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.song-count {
  font-size: 1rem;
  color: var(--text-secondary);
  background: var(--bg-surface);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-light);
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px var(--space-xl);
  flex: 1;
}

.empty-icon {
  font-size: 120px;
  margin-bottom: var(--space-2xl);
  opacity: 0.6;
}

.empty-title {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0 0 var(--space-lg) 0;
  font-weight: 600;
}

.empty-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3xl) 0;
  max-width: 400px;
  line-height: 1.6;
}

.back-to-library-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-2xl);
  background: var(--color-gradient);
  border: none;
  border-radius: var(--radius-xl);
  color: white;
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: 0 4px 16px var(--color-primary-light);
}

.back-to-library-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--color-primary-medium);
}

.btn-icon {
  font-size: 18px;
}

.favorites-grid {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-header h1 {
    font-size: 2rem;
  }

  .song-count {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }

  .content-header h1 {
    font-size: 1.8rem;
  }

  .empty-state {
    padding: 60px 15px;
  }

  .empty-icon {
    font-size: 80px;
  }

  .empty-title {
    font-size: 1.5rem;
  }

  .empty-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .content-header h1 {
    font-size: 1.5rem;
  }

  .song-count {
    font-size: 0.8rem;
    padding: 4px 8px;
  }

  .empty-state {
    padding: 40px 10px;
  }

  .empty-icon {
    font-size: 60px;
  }

  .empty-title {
    font-size: 1.3rem;
  }

  .back-to-library-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
