<template>
  <div class="song-list-container">
    <!-- 歌曲网格 -->
    <div class="songs-grid" @click="closeContextMenu">
      <div
          v-for="song in playlist"
          :key="song.id"
          class="song-card"
          :class="{
            active: currentSong?.id === song.id,
            playing: currentSong?.id === song.id && isPlaying
          }"
          @click="playSong(song)"
          @contextmenu.prevent="showContextMenu($event, song)"
      >
        <div class="song-controls">
          <button class="control-btn favorite" :class="{ active: song.isFavorite }" @click.stop="toggleFavorite(song)" :title="song.isFavorite ? '取消收藏' : '收藏'">
            {{ song.isFavorite ? '♥' : '♡' }}
          </button>
        </div>

        <div class="cover-container">
          <img
            :src="getCoverUrl(song.cover)"
            class="cover"
            :class="{
              'cd-spinning': currentSong?.id === song.id && isPlaying
            }"
            alt="歌曲封面"
          />
        </div>

        <div class="song-info">
          <h3 class="song-title">{{ song.title }}</h3>
          <p class="song-artist">{{ song.artist }}</p>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :song="contextMenu.song"
      :playlists="playlists"
      @delete-song="handleDeleteSong"
      @add-to-playlist="handleAddToPlaylist"
      @edit-song="handleEditSong"
      @close="closeContextMenu"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, onUnmounted } from 'vue'
import ContextMenu from './ContextMenu.vue'

const props = defineProps({
  playlist: Array,
  currentSong: Object,
  getCoverUrl: Function,
  isPlaying: Boolean,
  playlists: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['play-song', 'toggle-favorite', 'delete-song', 'add-to-playlist', 'edit-song'])

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  position: { x: 0, y: 0 },
  song: null
})

// 播放歌曲
const playSong = (song) => {
  emit('play-song', song)
}

// 切换收藏状态
const toggleFavorite = (song) => {
  emit('toggle-favorite', song)
}

// 显示右键菜单
const showContextMenu = (event, song) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    position: { x: event.clientX, y: event.clientY },
    song: song
  }
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenu.value.visible = false
}

// 处理删除歌曲
const handleDeleteSong = (song) => {
  emit('delete-song', song)
  closeContextMenu()
}

// 处理添加到歌单
const handleAddToPlaylist = (song, playlist) => {
  emit('add-to-playlist', song, playlist)
  closeContextMenu()
}

// 处理编辑歌曲
const handleEditSong = (song) => {
  emit('edit-song', song)
  closeContextMenu()
}

// 全局点击事件处理
const handleGlobalClick = (event) => {
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
/* 使用全局样式，只保留组件特定的覆盖 */
.song-controls {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  display: flex;
  gap: var(--space-xs);
  opacity: 1;
  transition: var(--transition-normal);
  z-index: 10;
}

/* 心形收藏按钮样式 */
.control-btn.favorite {
  width: auto;
  height: auto;
  border-radius: 0;
  background: none;
  backdrop-filter: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 32px;
  padding: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.control-btn.favorite:hover {
  background: none;
  transform: scale(1.2);
  color: rgba(255, 255, 255, 1);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}

.control-btn.favorite.active {
  color: #ef4444;
  text-shadow: 0 2px 8px rgba(239, 68, 68, 0.6);
}

/* 确保歌曲信息容器背景透明 */
.song-info {
  background: transparent !important;
}
</style>
