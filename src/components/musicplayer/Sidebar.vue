<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 折叠按钮 -->
    <button class="collapse-button" @click="toggleCollapse" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
      <span class="collapse-icon" :class="{ rotated: isCollapsed }">◀</span>
    </button>

    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-text" v-show="!isCollapsed">音乐播放器</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <h3 class="section-title" v-show="!isCollapsed">音乐库</h3>
        <ul class="nav-list">
          <li class="nav-item" :class="{ active: currentView === 'library' }">
            <button class="nav-button" @click="$emit('navigate', 'library')" :title="isCollapsed ? '我的音乐' : ''">
              <span class="nav-icon">🎶</span>
              <span class="nav-text" v-show="!isCollapsed">我的音乐</span>
              <span v-if="songCount > 0 && !isCollapsed" class="nav-badge">{{ songCount }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-button" @click="$emit('show-add-music')" :title="isCollapsed ? '添加音乐' : ''">
              <span class="nav-icon">➕</span>
              <span class="nav-text" v-show="!isCollapsed">添加音乐</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-button" @click="$emit('show-search')" :title="isCollapsed ? '搜索音乐' : ''">
              <span class="nav-icon">🔍</span>
              <span class="nav-text" v-show="!isCollapsed">搜索音乐</span>
            </button>
          </li>
          <li class="nav-item" :class="{ active: currentView === 'online-music' }">
            <button class="nav-button" @click="$emit('navigate', 'online-music')" :title="isCollapsed ? '网易云在线搜索' : ''">
              <span class="nav-icon">🎵</span>
              <span class="nav-text" v-show="!isCollapsed">网易云在线搜索</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-button" @click="$emit('show-resource-manager')" :title="isCollapsed ? '资源管理' : ''">
              <span class="nav-icon">🗂️</span>
              <span class="nav-text" v-show="!isCollapsed">资源管理</span>
            </button>
          </li>
        </ul>
      </div>
      
      <div class="nav-section">
        <h3 class="section-title" v-show="!isCollapsed">播放列表</h3>
        <ul class="nav-list">
          <li class="nav-item" :class="{ active: currentView === 'favorites' }">
            <button class="nav-button" @click="$emit('navigate', 'favorites')" :title="isCollapsed ? '我喜欢的' : ''">
              <span class="nav-icon">❤️</span>
              <span class="nav-text" v-show="!isCollapsed">我喜欢的</span>
            </button>
          </li>
          <li class="nav-item" :class="{ active: currentView === 'playlists' }">
            <button class="nav-button" @click="$emit('navigate', 'playlists')" :title="isCollapsed ? '我的歌单' : ''">
              <span class="nav-icon">📋</span>
              <span class="nav-text" v-show="!isCollapsed">我的歌单</span>
              <span class="nav-badge" v-if="playlistCount > 0 && !isCollapsed">{{ playlistCount }}</span>
            </button>
          </li>
          <li class="nav-item" :class="{ active: currentView === 'recent' }">
            <button class="nav-button" @click="$emit('navigate', 'recent')" :title="isCollapsed ? '随机歌曲' : ''">
              <span class="nav-icon">🎲</span>
              <span class="nav-text" v-show="!isCollapsed">随机歌曲</span>
            </button>
          </li>
        </ul>
      </div>

    </nav>
    
    <div class="sidebar-footer">
      <div class="playlist-stats" v-if="songCount > 0 && !isCollapsed">
        <p class="stats-text">总计 {{ songCount }} 首歌曲</p>
      </div>

      <!-- 底部控制按钮 -->
      <div class="bottom-controls">
        <!-- 用户设置按钮 -->
        <button class="control-btn" @click="$emit('show-settings')" :title="isCollapsed ? '用户设置' : ''">
          <span class="control-icon">⚙️</span>
          <span class="control-text" v-show="!isCollapsed">设置</span>
        </button>

        <!-- 主题切换按钮 -->
        <button class="control-btn theme-btn" @click="$emit('toggle-theme')" :title="isCollapsed ? (isDarkMode ? '切换到日间模式' : '切换到夜晚模式') : ''">
          <span class="control-icon theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span class="control-text theme-text" v-show="!isCollapsed">{{ isDarkMode ? '日间模式' : '夜晚模式' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  songCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
  playlistCount: {
    type: Number,
    default: 0
  },
  currentView: {
    type: String,
    default: 'library'
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'navigate',
  'show-add-music',
  'show-resource-manager',
  'clear-playlist',
  'sidebar-collapsed',
  'toggle-theme',
  'show-settings'
])

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  emit('sidebar-collapsed', isCollapsed.value)
}
</script>

<style scoped>
/* 使用全局样式，只保留组件特定的覆盖 */
</style>
