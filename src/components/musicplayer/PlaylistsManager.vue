<template>
  <div class="playlists-container">
    <div class="content-header">
      <h1>我的歌单</h1>
      <div class="header-actions">
        <button class="create-playlist-btn" @click="handleCreatePlaylist">
          <span class="btn-icon">➕</span>
          创建歌单
        </button>
      </div>
    </div>

    <div class="content-body">
      <!-- 歌单网格 -->
      <div v-if="playlists.length > 0" class="playlists-grid">
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-card"
          @click="openPlaylist(playlist)"
        >
          <div class="playlist-cover">
            <img :src="getPlaylistCover(playlist)" alt="歌单封面" />
            <div class="play-overlay">
              <div class="play-button">▶</div>
            </div>
          </div>
          <div class="playlist-info">
            <h3 class="playlist-name">{{ playlist.name }}</h3>
            <p class="playlist-count">{{ playlist.songs.length }} 首歌曲</p>
          </div>
          <div class="playlist-actions">
            <button @click.stop="editPlaylist(playlist)" class="action-btn" title="编辑">
              <span>✏️</span>
            </button>
            <button @click.stop="deletePlaylist(playlist)" class="action-btn delete" title="删除">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3 class="empty-title">还没有创建任何歌单</h3>
        <p class="empty-description">创建歌单来整理您喜欢的音乐</p>
        <button class="empty-create-btn" @click="handleCreatePlaylist">
          <span class="btn-icon">➕</span>
          创建第一个歌单
        </button>
      </div>
    </div>

    <!-- 创建/编辑歌单模态框 -->
    <CreatePlaylistModal
      v-if="showCreateModal"
      :playlist="editingPlaylist"
      @save="handleSavePlaylist"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CreatePlaylistModal from './CreatePlaylistModal.vue'

const props = defineProps({
  playlists: {
    type: Array,
    default: () => []
  },
  getCoverUrl: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['create-playlist', 'update-playlist', 'delete-playlist', 'open-playlist'])

// 模态框状态
const showCreateModal = ref(false)
const editingPlaylist = ref(null)

// 获取歌单封面
const getPlaylistCover = (playlist) => {
  if (playlist.cover) {
    return props.getCoverUrl(playlist.cover)
  }
  // 如果没有自定义封面，使用第一首歌的封面
  if (playlist.songs.length > 0 && playlist.songs[0].cover) {
    return props.getCoverUrl(playlist.songs[0].cover)
  }
  return getDefaultCover()
}

const getDefaultCover = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwNSAxNjBDMTMyLjYxNCAxNjAgMTYwIDEzMi42MTQgMTYwIDEwNUMxNjAgNzcuMzg1OCAxMzIuNjE0IDUwIDEwNSA1MEgxMDBWNTBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMTA1IiBjeT0iMTA1IiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPgo='
}

// 打开歌单
const openPlaylist = (playlist) => {
  emit('open-playlist', playlist)
}

// 处理创建歌单
const handleCreatePlaylist = () => {
  console.log('点击创建歌单按钮')
  editingPlaylist.value = null
  showCreateModal.value = true
  console.log('showCreateModal设置为:', showCreateModal.value)
}

// 编辑歌单
const editPlaylist = (playlist) => {
  editingPlaylist.value = playlist
  showCreateModal.value = true
}

// 删除歌单
const deletePlaylist = (playlist) => {
  if (confirm(`确定要删除歌单 "${playlist.name}" 吗？此操作不可恢复。`)) {
    emit('delete-playlist', playlist)
  }
}

// 保存歌单
const handleSavePlaylist = (playlistData) => {
  if (editingPlaylist.value) {
    emit('update-playlist', { ...editingPlaylist.value, ...playlistData })
  } else {
    emit('create-playlist', playlistData)
  }
  closeModal()
}

// 关闭模态框
const closeModal = () => {
  showCreateModal.value = false
  editingPlaylist.value = null
}
</script>

<style>
.playlists-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 基本容器样式 */
.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.btn-icon {
  font-size: 16px;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px var(--space-xl);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: var(--space-xl);
  opacity: 0.6;
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-md) 0;
}

.empty-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0 0 var(--space-3xl) 0;
  max-width: 400px;
  line-height: 1.5;
}

.empty-create-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-2xl);
  background: var(--color-gradient);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: 0 4px 16px var(--color-primary-light);
}

.empty-create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--color-primary-medium);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .playlists-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 900px) {
  .playlists-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .playlist-card {
    padding: 12px;
  }

  .playlist-name {
    font-size: 14px;
  }
}

@media (max-width: 600px) {
  .playlists-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .content-header h1 {
    font-size: 2rem;
  }

  .create-playlist-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
