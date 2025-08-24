<template>
  <div class="playlist-detail-container">
    <!-- 歌单头部信息 -->
    <div class="playlist-header">
      <div class="playlist-cover">
        <img :src="getPlaylistCover()" alt="歌单封面" />
      </div>
      <div class="playlist-info">
        <div class="playlist-meta">
          <span class="playlist-type">歌单</span>
        </div>
        <h1 class="playlist-title">{{ playlist.name }}</h1>
        <p class="playlist-description" v-if="playlist.description">
          {{ playlist.description }}
        </p>
        <div class="playlist-stats">
          <span class="song-count">{{ playlist.songs.length }} 首歌曲</span>
          <span class="created-date">创建于 {{ formatDate(playlist.createdAt) }}</span>
        </div>
        <div class="playlist-actions">
          <button class="edit-btn" @click="editPlaylist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            编辑
          </button>
          <button class="back-btn" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            返回
          </button>
        </div>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="playlist-content">
      <div v-if="playlist.songs.length > 0" class="songs-section">
        <!-- 视图控制 -->
        <div class="playlist-controls">
          <!-- 切换视图按钮 -->
          <div class="view-toggle">
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
              </svg>
              网格视图
            </button>
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/>
              </svg>
              列表视图
            </button>
          </div>
        </div>

        <!-- 网格视图 -->
        <PlaylistSongGrid
          v-if="viewMode === 'grid'"
          :playlist="playlist.songs"
          :current-song="currentSong"
          :is-playing="isPlaying"
          :get-cover-url="getCoverUrl"
          :playlists="playlists"
          @play-song="playSong"
          @delete-song="removeSongFromPlaylist"
          @add-to-playlist="addToPlaylist"
          @play-order="playOrder"
          @play-loop="playLoop"
          @shuffle-play="shufflePlay"
        />

        <!-- 列表视图（可拖拽排序） -->
        <DraggableSongList
          v-else
          :songs="playlist.songs"
          :current-song="currentSong"
          :is-playing="isPlaying"
          :get-cover-url="getCoverUrl"
          @play-song="playSong"
          @toggle-favorite="toggleFavorite"
          @remove-song="removeSongFromPlaylist"
          @update-order="updateSongOrder"
          @play-order="playOrder"
          @play-loop="playLoop"
          @shuffle-play="shufflePlay"
        />
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎵</div>
        <h3 class="empty-title">歌单还没有歌曲</h3>
        <p class="empty-description">通过右键菜单将歌曲添加到这个歌单</p>
        <button class="back-to-library-btn" @click="$emit('navigate', 'library')">
          <span class="btn-icon">🎶</span>
          去添加歌曲
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PlaylistSongGrid from './PlaylistSongGrid.vue'
import DraggableSongList from './DraggableSongList.vue'

// 视图模式
const viewMode = ref('grid')

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  },
  currentSong: Object,
  isPlaying: Boolean,
  getCoverUrl: Function,
  playlists: {
    type: Array,
    default: () => []
  },
  playMode: {
    type: String,
    default: 'order'
  }
})

const emit = defineEmits([
  'play-song',
  'toggle-favorite',
  'remove-song',
  'edit-playlist',
  'go-back',
  'navigate',
  'play-order',
  'play-loop',
  'shuffle-play',
  'toggle-loop',
  'update-song-order',
  'add-to-playlist'
])

// 获取歌单封面
const getPlaylistCover = () => {
  if (props.playlist.cover) {
    return props.getCoverUrl(props.playlist.cover)
  }
  // 如果没有自定义封面，使用第一首歌的封面
  if (props.playlist.songs.length > 0 && props.playlist.songs[0].cover) {
    return props.getCoverUrl(props.playlist.songs[0].cover)
  }
  return getDefaultCover()
}

const getDefaultCover = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwNSAxNjBDMTMyLjYxNCAxNjAgMTYwIDEzMi42MTQgMTYwIDEwNUMxNjAgNzcuMzg1OCAxMzIuNjE0IDUwIDEwNSA1MEgxMDBWNTBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMTA1IiBjeT0iMTA1IiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+CjxwYXRoIGQ9Ik0xMDAgODBMMTIwIDEwMEwxMDAgMTIwVjgwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 播放歌曲
const playSong = (song) => {
  emit('play-song', song)
}

// 切换收藏
const toggleFavorite = (song) => {
  emit('toggle-favorite', song)
}

// 添加到歌单
const addToPlaylist = (song, playlist) => {
  emit('add-to-playlist', song, playlist)
}

// 从歌单移除歌曲
const removeSongFromPlaylist = (song) => {
  if (confirm(`确定要从歌单中移除 "${song.title}" 吗？`)) {
    emit('remove-song', song)
  }
}

// 编辑歌单
const editPlaylist = () => {
  emit('edit-playlist', props.playlist)
}

// 返回
const goBack = () => {
  emit('go-back')
}

// 更新歌曲顺序
const updateSongOrder = (newOrder) => {
  emit('update-song-order', newOrder)
}

// 顺序播放（播放完停止）
const playOrder = (songs) => {
  emit('play-order', songs)
}

// 循环播放（播放完继续循环）
const playLoop = (songs) => {
  emit('play-loop', songs)
}

// 随机播放（播放完继续随机）
const shufflePlay = (songs) => {
  emit('shuffle-play', songs)
}
</script>

<style>
.playlist-detail-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}
</style>
