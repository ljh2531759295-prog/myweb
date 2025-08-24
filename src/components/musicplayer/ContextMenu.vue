<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
    @click.stop
  >
    <div class="menu-item" @click="editSong">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      <span>编辑信息</span>
    </div>
    <div class="menu-item" @click="showAddToPlaylist" v-if="playlists.length > 0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
      </svg>
      <span>加入歌单</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="arrow-icon">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
      </svg>
    </div>
    <div class="menu-item" @click="deleteSong">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
      <span>删除歌曲</span>
    </div>

    <!-- 歌单子菜单 -->
    <div
      v-if="showPlaylistSubmenu"
      class="submenu"
      :style="submenuStyle"
    >
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="submenu-item"
        @click="addToPlaylist(playlist)"
      >
        <div class="playlist-icon">📋</div>
        <span>{{ playlist.name }}</span>
        <span class="song-count">({{ playlist.songs.length }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  song: {
    type: Object,
    default: null
  },
  playlists: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-song', 'add-to-playlist', 'edit-song', 'close'])

// 子菜单状态
const showPlaylistSubmenu = ref(false)

// 子菜单样式
const submenuStyle = computed(() => {
  return {
    top: '0px',
    left: '100%'
  }
})

// 显示歌单子菜单
const showAddToPlaylist = () => {
  showPlaylistSubmenu.value = !showPlaylistSubmenu.value
}

// 添加到歌单
const addToPlaylist = (playlist) => {
  if (props.song) {
    emit('add-to-playlist', props.song, playlist)
  }
  emit('close')
}

// 编辑歌曲信息
const editSong = () => {
  if (props.song) {
    emit('edit-song', props.song)
  }
  emit('close')
}

// 删除歌曲
const deleteSong = () => {
  if (props.song) {
    emit('delete-song', props.song)
  }
  emit('close')
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
}

.menu-item svg {
  flex-shrink: 0;
}

.arrow-icon {
  margin-left: auto;
  opacity: 0.6;
}

/* 子菜单样式 */
.submenu {
  position: absolute;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1001;
  min-width: 180px;
  max-height: 200px;
  overflow-y: auto;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.submenu-item:hover {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.playlist-icon {
  flex-shrink: 0;
  font-size: 12px;
}

.song-count {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.6;
}

/* 自定义滚动条 */
.submenu::-webkit-scrollbar {
  width: 4px;
}

.submenu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.submenu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.submenu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
