<template>
  <div class="app">
    <!-- 左侧导航栏 -->
    <Sidebar
      :song-count="playlist.length"
      :favorite-count="favoriteSongs.length"
      :playlist-count="playlists.length"
      :current-view="currentView"
      :is-dark-mode="isDarkMode"
      @navigate="handleNavigate"
      @show-add-music="showAddMusicModal = true"
      @show-resource-manager="showResourceManager = true"
      @show-search="showSearchModal = true"
      @sidebar-collapsed="handleSidebarCollapsed"
      @toggle-theme="toggleTheme"
      @show-settings="showUserSettings = true"
    />

    <!-- 主内容区域 -->
    <div class="main-content" :class="{
      'sidebar-collapsed': isSidebarCollapsed,
      'player-visible': showPlayer
    }">
      <!-- 我的音乐页面 -->
      <div v-if="currentView === 'library'" class="library-view">
        <div class="content-header">
          <div class="header-title">
            <span class="title-icon">🎶</span>
            <h1>我的音乐</h1>
          </div>
          <div class="header-actions">
            <button class="add-music-btn" @click="showAddMusicModal = true">
              <span class="btn-icon">➕</span>
              添加音乐
            </button>
          </div>
        </div>

        <!-- 歌曲网格 -->
        <div class="content-body">
          <SongList
              v-if="playlist.length > 0"
              :playlist="playlist"
              :current-song="currentSong"
              :is-playing="isPlaying"
              :get-cover-url="getCoverUrl"
              :playlists="playlists"
              @play-song="playSong"
              @toggle-favorite="toggleFavorite"
              @delete-song="handleDeleteSong"
              @add-to-playlist="addSongToPlaylist"
              @edit-song="handleEditSong"
          />

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <div class="empty-icon">🎵</div>
            <h3>还没有添加任何音乐</h3>
            <p>点击"添加音乐"按钮开始上传您的音乐文件</p>
            <button class="empty-add-btn" @click="showAddMusicModal = true">
              <span class="btn-icon">➕</span>
              添加音乐
            </button>
          </div>
        </div>
      </div>

      <!-- 我喜欢的页面 -->
      <div v-else-if="currentView === 'favorites'" class="favorites-view">
        <FavoritesList
          :playlist="playlist"
          :current-song="currentSong"
          :is-playing="isPlaying"
          :get-cover-url="getCoverUrl"
          :playlists="playlists"
          @play-song="playSong"
          @toggle-favorite="toggleFavorite"
          @navigate="handleNavigate"
          @delete-song="handleDeleteSong"
          @add-to-playlist="addSongToPlaylist"
        />
      </div>

      <!-- 我的歌单页面 -->
      <div v-else-if="currentView === 'playlists'" class="playlists-view">
        <PlaylistsManager
          :playlists="playlists"
          :get-cover-url="getCoverUrl"
          @create-playlist="createPlaylist"
          @update-playlist="updatePlaylist"
          @delete-playlist="deletePlaylist"
          @open-playlist="openPlaylist"
        />
      </div>

      <!-- 歌单详情页面 -->
      <div v-else-if="currentView === 'playlist-detail' && currentPlaylist" class="playlist-detail-view">
        <PlaylistDetail
          :playlist="currentPlaylist"
          :current-song="currentSong"
          :is-playing="isPlaying"
          :get-cover-url="getCoverUrl"
          :play-mode="playMode"
          :playlists="playlists"
          @play-song="playSong"
          @toggle-favorite="toggleFavorite"
          @remove-song="removeSongFromPlaylist"
          @edit-playlist="editPlaylist"
          @go-back="goBackToPlaylists"
          @navigate="handleNavigate"
          @play-order="playOrderFromPlaylist"
          @play-loop="playLoopFromPlaylist"
          @shuffle-play="shufflePlayFromPlaylist"
          @toggle-loop="toggleLoop"
          @update-song-order="updatePlaylistSongOrder"
          @add-to-playlist="addSongToPlaylist"
        />
      </div>

      <!-- 网易云音乐在线搜索页面 -->
      <div v-else-if="currentView === 'online-music'" class="netease-online-view">
        <div class="content-header">
          <div class="header-title">
            <span class="title-icon">🎵</span>
            <h1>网易云音乐在线搜索</h1>
          </div>
        </div>
        <div class="content-body">
          <NeteaseMusicOnlineSearch
            @songs-imported="handleNeteaseSongsImported"
          />
        </div>
      </div>

      <!-- 随机歌曲页面 -->
      <div v-else-if="currentView === 'recent'" class="recent-view">
        <div class="content-header">
          <div class="header-title">
            <span class="title-icon">🎲</span>
            <h1>随机歌曲</h1>
          </div>
          <div class="header-actions">
            <button class="refresh-btn" @click="refreshRecentSongs" title="刷新随机歌曲">
              <span class="btn-icon">🔄</span>
              刷新
            </button>
          </div>
        </div>

        <!-- 歌曲网格 -->
        <div class="content-body">
          <SongList
              v-if="recentSongs.length > 0"
              :playlist="recentSongs"
              :current-song="currentSong"
              :is-playing="isPlaying"
              :get-cover-url="getCoverUrl"
              :playlists="playlists"
              @play-song="playSong"
              @toggle-favorite="toggleFavorite"
              @delete-song="handleDeleteSong"
              @add-to-playlist="addSongToPlaylist"
              @edit-song="handleEditSong"
          />

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <div class="empty-icon">🎲</div>
            <h3>暂无随机歌曲</h3>
            <p>音乐库中还没有歌曲，请先添加一些音乐</p>
            <button class="empty-add-btn" @click="showAddMusicModal = true">
              <span class="btn-icon">➕</span>
              添加音乐
            </button>
          </div>
        </div>
      </div>

      <!-- 其他页面可以在这里添加 -->
      <div v-else class="other-view">
        <div class="content-header">
          <h1>{{ getViewTitle(currentView) }}</h1>
        </div>
        <div class="content-body">
          <div class="coming-soon">
            <div class="coming-soon-icon">🚧</div>
            <h3>功能开发中</h3>
            <p>该功能正在开发中，敬请期待...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加音乐弹窗 -->
    <AddMusicModal
        v-if="showAddMusicModal"
        @close="showAddMusicModal = false"
        @files-uploaded="handleFilesUploaded"
    />

    <!-- 资源管理器 -->
    <ResourceManager
        v-if="showResourceManager"
        @close="showResourceManager = false"
        @assets-changed="handleAssetsChanged"
    />

    <!-- 编辑歌曲模态框 -->
    <EditSongModal
        v-if="showEditSongModal"
        :song="editingSong"
        :get-cover-url="getCoverUrl"
        :resource-manager="resourceManager"
        @close="showEditSongModal = false"
        @save="handleSaveSong"
    />

    <!-- 搜索模态框 -->
    <SearchModal
        v-if="showSearchModal"
        :search-query="searchQuery"
        :search-results="searchResults"
        :current-song="currentSong"
        :is-playing="isPlaying"
        :get-cover-url="getCoverUrl"
        @close="showSearchModal = false"
        @search="performSearch"
        @clear-search="clearSearch"
        @play-song="playSong"
        @toggle-favorite="toggleFavorite"
    />

    <!-- 快捷键帮助 -->
    <KeyboardShortcuts
        v-if="showKeyboardShortcuts"
        @close="showKeyboardShortcuts = false"
    />



    <!-- 全屏播放器 -->
    <div v-if="showFullPlayer && currentSong" class="fullscreen-player" @click="minimizePlayer">
      <div class="fullscreen-content" @click.stop>
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="closeFullPlayer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 主要内容区域 -->
        <div class="player-main">
          <!-- 左侧：CD动画区域 -->
          <div class="cd-area">
            <div class="cd-container">
              <div class="cd-disc" :class="{ 'spinning': isPlaying }">
                <img
                  :src="getCoverUrl(currentSong.cover, currentSong.coverUrl)"
                  :alt="currentSong.title"
                  class="cd-cover"
                />
              </div>
            </div>

            <!-- 歌曲信息 -->
            <div class="song-info">
              <h2 class="song-title">{{ currentSong.title }}</h2>
              <p class="song-artist">{{ currentSong.artist }}</p>
            </div>
          </div>

          <!-- 右侧：歌词区域 -->
          <div class="lyrics-area">
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
                <div class="no-lyrics-icon">🎵</div>
                <p>《{{ currentSong.title }}》暂无歌词</p>
                <button class="add-lyrics-btn" @click="handleEditSong(currentSong)">
                  添加歌词
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部控制栏 -->
        <div class="fullscreen-controls">
          <div class="control-bar">
            <!-- 歌曲信息 -->
            <div class="song-display">
              <img :src="getCoverUrl(currentSong.cover, currentSong.coverUrl)" class="control-cover" alt="专辑封面" />
              <div class="song-details">
                <div class="control-title">{{ currentSong.title }}</div>
                <div class="control-artist">{{ currentSong.artist }}</div>
              </div>
              <button
                class="favorite-btn"
                :class="{ 'is-favorite': isFavorite(currentSong) }"
                @click="toggleFavorite(currentSong)"
                title="收藏"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        :fill="isFavorite(currentSong) ? '#ff4757' : 'none'"
                        stroke="currentColor"
                        stroke-width="2"/>
                </svg>
              </button>
            </div>

            <!-- 播放控制 -->
            <div class="playback-controls">
              <button @click="toggleShuffle" :class="{ 'active': isShuffleMode }" title="随机播放">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <button @click="prevSong" title="上一首">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 20L9 12l10-8v16zM5 19V5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <button class="play-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
                <svg v-if="!isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/>
                </svg>
              </button>

              <button @click="nextSong" title="下一首">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 4l10 8-10 8V4zM19 5v14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <button @click="toggleRepeat" :class="{ 'active': isRepeatMode }" title="循环播放">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>

            <!-- 进度条 -->
            <div class="progress-section">
              <span class="time-display">{{ formatTime(currentTime) }}</span>
              <div class="progress-container" @click="handleProgressClick" ref="progressContainer">
                <div class="progress-track"></div>
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                <div class="progress-thumb" :style="{ left: progressPercentage + '%' }"></div>
              </div>
              <span class="time-display">{{ formatTime(duration) }}</span>
            </div>

            <!-- 音量控制 -->
            <div class="volume-section">
              <button @click="toggleMute" title="静音">
                <svg v-if="!isMuted && volume > 50" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else-if="!isMuted && volume > 0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <div class="volume-slider" @click="handleVolumeClick" ref="volumeSlider">
                <div class="volume-track"></div>
                <div class="volume-fill" :style="{ width: (isMuted ? 0 : volume) + '%' }"></div>
                <div class="volume-thumb" :style="{ left: (isMuted ? 0 : volume) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 集成播放器 -->
    <!-- <IntegratedPlayer
        v-if="currentSong && showPlayer && !showFullPlayer"
        :current-song="currentSong"
        :is-playing="isPlaying"
        :current-time="currentTime"
        :duration="duration"
        :volume="volume"
        :is-muted="isMuted"
        :is-shuffle-mode="isShuffleMode"
        :is-repeat-mode="isRepeatMode"
        :sidebar-collapsed="isSidebarCollapsed"
        :favorites="favorites"
        :lyrics="currentSong?.lyrics || ''"
        @toggle-play="togglePlay"
        @next-song="nextSong"
        @prev-song="prevSong"
        @seek-to="seekTo"
        @seek-to-time="seekToTime"
        @update-volume="updateVolume"
        @toggle-mute="toggleMute"
        @toggle-shuffle="toggleShuffle"
        @toggle-repeat="toggleRepeat"
        @toggle-favorite="toggleFavorite"
        @edit-song="handleEditSong"
        @toggle-playlist="togglePlaylistView"
        @hide-player="hidePlayer"
        @close-player="closePlayer"
    /> -->

    <!-- 显示播放栏的浮动按钮 -->
    <div
      v-if="currentSong && !showPlayer"
      class="show-player-btn"
      @click="showPlayerBar"
      title="显示播放栏"
    >
      <div class="mini-player-info">
        <img :src="getCoverUrl(currentSong.cover, currentSong.coverUrl)" class="mini-cover" alt="专辑封面" />
        <div class="mini-details">
          <div class="mini-title">{{ currentSong.title }}</div>
          <div class="mini-artist">{{ currentSong.artist }}</div>
        </div>
      </div>
      <div class="mini-controls">
        <button class="mini-play-btn" @click.stop="togglePlay">
          <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <button class="show-up-btn" @click.stop="showPlayerBar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 用户设置模态框 -->
    <UserSettings
      v-if="showUserSettings"
      :is-dark-mode="isDarkMode"
      @close="showUserSettings = false"
      @theme-changed="handleThemeChanged"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Sidebar from '@/components/musicplayer/Sidebar.vue'
import SongList from '@/components/musicplayer/SongList.vue'
import IntegratedPlayer from '@/components/musicplayer/IntegratedPlayer.vue'
import AddMusicModal from '@/components/musicplayer/AddMusicModal.vue'
import EditSongModal from '@/components/musicplayer/EditSongModal.vue'
import SearchModal from '@/components/musicplayer/SearchModal.vue'
import KeyboardShortcuts from '@/components/musicplayer/KeyboardShortcuts.vue'
import NeteaseMusicOnlineSearch from '@/components/musicplayer/NeteaseMusicOnlineSearch.vue'
import { useTheme } from '@/composables/useTheme.js'
import ResourceManager from '@/components/musicplayer/ResourceManager.vue'
import FavoritesList from '@/components/musicplayer/FavoritesList.vue'
import PlaylistsManager from '@/components/musicplayer/PlaylistsManager.vue'
import PlaylistDetail from '@/components/musicplayer/PlaylistDetail.vue'
import UserSettings from '@/components/musicplayer/UserSettings.vue'
import { generateId, resourceManager } from '@/utils/fileUtils'

// 播放列表数据 - 从本地存储加载
const playlist = ref([])

// 歌单数据
const playlists = ref([])
const currentPlaylist = ref(null) // 当前查看的歌单
const playMode = ref('order') // 播放模式：'order'(顺序), 'loop'(循环), 'shuffle'(随机)
const currentPlayingPlaylist = ref(null) // 当前正在播放的歌单
const playlistOrder = ref([]) // 歌单播放顺序
const originalPlaylistOrder = ref([]) // 原始歌单顺序（用于随机播放时记录）

// 默认封面图片（当没有上传封面时使用）
const defaultCover = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwNSAxNjBDMTMyLjYxNCAxNjAgMTYwIDEzMi42MTQgMTYwIDEwNUMxNjAgNzcuMzg1OCAxMzIuNjE0IDUwIDEwNSA1MEgxMDBWNTBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMTA1IiBjeT0iMTA1IiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPgo='

// 上传的文件存储
const uploadedFiles = ref(new Map())

// 弹窗显示状态
const showAddMusicModal = ref(false)
const showResourceManager = ref(false)
const showEditSongModal = ref(false)
const showSearchModal = ref(false)
const showKeyboardShortcuts = ref(false)
const showUserSettings = ref(false)
const editingSong = ref(null)

// 主题管理
const { isDarkMode, toggleTheme, loadTheme } = useTheme()

// 立即加载主题设置
loadTheme().catch(error => {
  console.error('加载主题设置失败:', error)
})

// 处理主题变化
const handleThemeChanged = async (isDark) => {
  try {
    isDarkMode.value = isDark
    await resourceManager.saveTheme(isDark)
    console.log(`主题已更新为: ${isDark ? '深色' : '浅色'}`)
  } catch (error) {
    console.error('更新主题失败:', error)
  }
}

// 播放器状态
const currentSong = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(80)
const audioRef = ref(null)
const showPlayer = ref(true) // 控制播放器显示
const showFullPlayer = ref(false) // 控制全屏播放器显示
const isShuffleMode = ref(false) // 随机播放模式
const isRepeatMode = ref(false) // 循环播放模式
const isMuted = ref(false) // 静音状态
const previousVolume = ref(80) // 静音前的音量
const playbackRate = ref(1) // 播放速度

// 随机歌曲状态
const recentSongs = ref([]) // 随机歌曲列表

// 侧边栏状态
const isSidebarCollapsed = ref(false)

// 当前视图状态
const currentView = ref('library')

// 搜索状态
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

// 本地存储键名
const PLAYLIST_STORAGE_KEY = 'musicplayer_playlist'
const PLAYLISTS_STORAGE_KEY = 'musicplayer_playlists'

// 计算属性
const favoriteSongs = computed(() => {
  return playlist.value.filter(song => song.isFavorite)
})

// 获取歌曲资源URL
const getSongUrl = async (songFile) => {
  // 如果是上传的文件或网易云下载的文件，从resourceManager中获取URL
  if (songFile && (songFile.startsWith('uploaded_') || songFile.startsWith('netease_'))) {
    try {
      const url = await resourceManager.getFile('songs', songFile)
      console.log('从IndexedDB获取歌曲URL:', songFile, '->', url)
      return url || new URL(`/src/assets/music/songs/${songFile}`, import.meta.url).href
    } catch (error) {
      console.error('获取歌曲文件失败:', error)
      return new URL(`/src/assets/music/songs/${songFile}`, import.meta.url).href
    }
  }
  // 否则使用assets中的资源
  return new URL(`/src/assets/music/songs/${songFile}`, import.meta.url).href
}

// 封面URL缓存
const coverUrlCache = ref(new Map())

// 获取封面资源URL (同步版本)
const getCoverUrl = (cover, coverUrl = null) => {
  // 如果没有封面，使用默认封面
  if (!cover && !coverUrl) {
    return defaultCover
  }

  // 如果有在线封面URL，直接使用
  if (coverUrl && (coverUrl.startsWith('http://') || coverUrl.startsWith('https://'))) {
    return coverUrl
  }

  // 如果是 base64 数据URL，直接返回
  if (cover && cover.startsWith('data:')) {
    return cover
  }

  // 如果是在线URL，直接返回
  if (cover && (cover.startsWith('http://') || cover.startsWith('https://'))) {
    return cover
  }

  // 如果是上传的文件、下载的文件或网易云文件，从缓存中获取URL
  if (cover && (cover.startsWith('uploaded_') || cover.startsWith('downloaded_') || cover.startsWith('netease_'))) {
    if (coverUrlCache.value.has(cover)) {
      return coverUrlCache.value.get(cover)
    }
    // 如果缓存中没有，异步加载并返回默认封面
    loadCoverUrl(cover)
    return defaultCover
  }

  // 否则使用assets中的资源
  try {
    return new URL(`/src/assets/music/covers/${cover}`, import.meta.url).href
  } catch (error) {
    console.error('获取assets封面失败:', error)
    return defaultCover
  }
}

// 异步加载封面URL
const loadCoverUrl = async (cover) => {
  try {
    await resourceManager.init()
    const url = await resourceManager.getFile('covers', cover)
    if (url) {
      coverUrlCache.value.set(cover, url)
    }
  } catch (error) {
    console.error('加载封面URL失败:', error)
  }
}

// 获取LRC歌词内容
const getLrcContent = async (lrcFile) => {
  if (!lrcFile) return null

  try {
    // 如果是上传的文件，从resourceManager中获取
    if (lrcFile.startsWith('uploaded_') || lrcFile.startsWith('downloaded_')) {
      await resourceManager.init()
      const url = await resourceManager.getFile('lyrics', lrcFile)
      if (url) {
        const response = await fetch(url)
        const text = await response.text()
        URL.revokeObjectURL(url) // 清理URL
        return text
      }
    } else {
      // 否则使用assets中的资源
      const response = await fetch(new URL(`/src/assets/music/lyrics/${lrcFile}`, import.meta.url).href)
      return await response.text()
    }
  } catch (error) {
    console.error('获取歌词失败:', error)
    return null
  }
}

// 播放控制方法
const playSong = async (song) => {
  // 如果点击的是正在播放的歌曲，则隐藏播放栏并停止播放
  if (currentSong.value && currentSong.value.id === song.id && isPlaying.value) {
    isPlaying.value = false
    showPlayer.value = false // 隐藏播放栏
    showFullPlayer.value = false // 隐藏全屏播放器
    if (audioRef.value) {
      audioRef.value.pause()
    }
    return
  }

  // 先停止当前播放的音频
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }

  currentSong.value = song
  isPlaying.value = true
  showPlayer.value = true // 播放时显示播放器
  showFullPlayer.value = true // 直接显示全屏播放器

  // 确保audio元素存在
  if (!audioRef.value) {
    audioRef.value = new Audio()
    audioRef.value.addEventListener('timeupdate', updateTime)
    audioRef.value.addEventListener('loadedmetadata', updateDuration)
    audioRef.value.addEventListener('ended', onSongEnded)
  }

  try {
    // 获取歌曲URL（异步）
    const songUrl = await getSongUrl(song.song)
    console.log('播放歌曲:', song.title, '- URL:', songUrl)

    // 设置新的音频源
    audioRef.value.src = songUrl
    audioRef.value.volume = volume.value / 100
    audioRef.value.playbackRate = playbackRate.value

    // 重置时间显示
    currentTime.value = 0
    duration.value = 0

    await audioRef.value.play()
  } catch (error) {
    console.error('播放失败:', error, '歌曲:', song.title)
    isPlaying.value = false
  }
}

const togglePlay = () => {
  if (!audioRef.value || !currentSong.value) {
    console.warn('音频元素或当前歌曲不存在')
    return
  }

  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    audioRef.value.play().catch(error => {
      console.error('播放失败:', error)
      isPlaying.value = false
    })
  } else {
    audioRef.value.pause()
  }
}

const nextSong = () => {
  // 如果正在播放歌单，使用歌单顺序
  if (currentPlayingPlaylist.value && playlistOrder.value.length > 0) {
    const currentIndex = playlistOrder.value.findIndex(s => s.id === currentSong.value?.id)
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % playlistOrder.value.length
      playSong(playlistOrder.value[nextIndex])
      return
    }
  }

  // 否则使用主播放列表
  const currentIndex = playlist.value.findIndex(s => s.id === currentSong.value?.id)
  const nextIndex = (currentIndex + 1) % playlist.value.length
  playSong(playlist.value[nextIndex])
}

const prevSong = () => {
  // 如果正在播放歌单，使用歌单顺序
  if (currentPlayingPlaylist.value && playlistOrder.value.length > 0) {
    const currentIndex = playlistOrder.value.findIndex(s => s.id === currentSong.value?.id)
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + playlistOrder.value.length) % playlistOrder.value.length
      playSong(playlistOrder.value[prevIndex])
      return
    }
  }

  // 否则使用主播放列表
  const currentIndex = playlist.value.findIndex(s => s.id === currentSong.value?.id)
  const prevIndex = (currentIndex - 1 + playlist.value.length) % playlist.value.length
  playSong(playlist.value[prevIndex])
}

const seekTo = (position) => {
  if (!audioRef.value || !duration.value || isNaN(duration.value) || duration.value <= 0) {
    return
  }

  // 确保position在有效范围内
  const clampedPosition = Math.max(0, Math.min(1, position))
  const targetTime = clampedPosition * duration.value

  // 确保目标时间在有效范围内
  if (targetTime >= 0 && targetTime <= duration.value) {
    try {
      audioRef.value.currentTime = targetTime
    } catch (error) {
      console.error('跳转失败:', error)
    }
  }
}

// 按时间跳转（接受秒数参数）
const seekToTime = (timeInSeconds) => {
  if (!audioRef.value || !duration.value || isNaN(duration.value) || duration.value <= 0) {
    return
  }

  // 确保时间在有效范围内
  const clampedTime = Math.max(0, Math.min(duration.value, timeInSeconds))

  try {
    audioRef.value.currentTime = clampedTime
  } catch (error) {
    console.error('时间跳转失败:', error)
  }
}

const updateVolume = (newVolume) => {
  volume.value = newVolume
  audioRef.value.volume = newVolume / 100
}

// 设置音量（用于快捷键）
const setVolume = (newVolume) => {
  const clampedVolume = Math.max(0, Math.min(1, newVolume))
  volume.value = clampedVolume * 100
  if (audioRef.value) {
    audioRef.value.volume = clampedVolume
  }
}

// 播放速度控制
const setPlaybackRate = (rate) => {
  playbackRate.value = rate
  if (audioRef.value) {
    audioRef.value.playbackRate = rate
  }
}

// 搜索功能
const performSearch = (query) => {
  searchQuery.value = query
  if (!query.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  const lowerQuery = query.toLowerCase()

  // 搜索所有歌曲
  const allSongs = [...playlist.value]

  // 搜索播放列表中的歌曲
  playlists.value.forEach(pl => {
    allSongs.push(...pl.songs)
  })

  // 去重
  const uniqueSongs = allSongs.filter((song, index, self) =>
    index === self.findIndex(s => s.id === song.id)
  )

  // 执行搜索
  searchResults.value = uniqueSongs.filter(song =>
    song.title.toLowerCase().includes(lowerQuery) ||
    song.artist.toLowerCase().includes(lowerQuery) ||
    (song.album && song.album.toLowerCase().includes(lowerQuery))
  )
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  isSearching.value = false
}

// 处理网易云音乐导入
const handleNeteaseSongsImported = async (songs) => {
  try {
    console.log('网易云音乐导入完成:', songs.length, '首歌曲')

    let successCount = 0
    for (const songData of songs) {
      try {
        console.log('处理歌曲数据:', songData)

        // 创建新的歌曲对象 - 直接使用已经保存的文件名
        const newSong = {
          id: parseInt(songData.id, 36),
          title: songData.title,
          artist: songData.artist,
          album: songData.album || '',
          duration: songData.duration || 0,
          song: songData.audioFile, // 使用已保存的音频文件名
          cover: songData.coverFile, // 使用已保存的封面文件名
          coverUrl: songData.coverUrl, // 在线封面URL（备用）
          lrcFile: songData.lrcFile, // 使用已保存的歌词文件名（统一使用lrcFile字段）
          isUploaded: true,
          isFavorite: false,
          source: 'netease', // 标记来源
          sourceId: songData.sourceId // 保存网易云音乐ID
        }

        console.log('创建的歌曲对象:', newSong)

        // 添加到本地音乐库
        playlist.value.push(newSong)

        // 预加载封面URL到缓存
        if (newSong.cover) {
          loadCoverUrl(newSong.cover)
        }

        successCount++
      } catch (error) {
        console.error('导入歌曲失败:', songData.title, error)
      }
    }

    // 保存到本地存储
    savePlaylistToStorage()

    // 显示成功通知
    showNotification(`成功导入 ${successCount} 首歌曲到音乐库`)

    console.log('网易云音乐导入完成，成功:', successCount, '首')
  } catch (error) {
    console.error('导入网易云音乐失败:', error)
    showNotification('导入网易云音乐失败')
  }
}

// 显示通知（简单实现）
const showNotification = (message) => {
  // 创建一个简单的通知
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-primary);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
  `

  document.body.appendChild(notification)

  // 3秒后自动移除
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 3000)
}

// 检查歌曲是否为收藏
const isFavorite = (song) => {
  if (!song) return false
  return song.isFavorite === true
}

// 新增的播放器控制方法
const toggleFavorite = (song = null) => {
  // 如果没有传入歌曲参数，使用当前播放的歌曲
  const targetSong = song || currentSong.value
  if (targetSong) {
    const songIndex = playlist.value.findIndex(s => s.id === targetSong.id)
    if (songIndex !== -1) {
      playlist.value[songIndex].isFavorite = !playlist.value[songIndex].isFavorite
      // 如果是当前播放的歌曲，同时更新currentSong的状态
      if (currentSong.value && currentSong.value.id === targetSong.id) {
        currentSong.value.isFavorite = playlist.value[songIndex].isFavorite
      }
      savePlaylistToStorage()
    }
  }
}

const toggleShuffle = () => {
  isShuffleMode.value = !isShuffleMode.value
  console.log('随机播放模式:', isShuffleMode.value ? '开启' : '关闭')
}

const toggleRepeat = () => {
  isRepeatMode.value = !isRepeatMode.value
  console.log('循环播放模式:', isRepeatMode.value ? '开启' : '关闭')
}

const togglePlaylistView = () => {
  // 切换到播放列表视图
  currentView.value = 'playlists'
  console.log('切换到播放列表视图')
}

const toggleFullscreen = () => {
  showFullPlayer.value = !showFullPlayer.value
}

const toggleBrowserFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log('无法进入全屏模式:', err)
    })
  } else {
    document.exitFullscreen()
  }
}

const toggleMute = () => {
  if (isMuted.value) {
    // 取消静音
    volume.value = previousVolume.value
    audioRef.value.volume = volume.value / 100
    isMuted.value = false
  } else {
    // 静音
    previousVolume.value = volume.value
    volume.value = 0
    audioRef.value.volume = 0
    isMuted.value = true
  }
}

// 音频事件处理
const updateTime = () => {
  if (audioRef.value && !isNaN(audioRef.value.currentTime)) {
    currentTime.value = audioRef.value.currentTime
  }
}

const updateDuration = () => {
  if (audioRef.value && !isNaN(audioRef.value.duration) && audioRef.value.duration > 0) {
    duration.value = audioRef.value.duration
  }
}

const onSongEnded = () => {
  // 如果正在播放歌单
  if (currentPlayingPlaylist.value && playlistOrder.value.length > 0) {
    const currentIndex = playlistOrder.value.findIndex(s => s.id === currentSong.value?.id)

    if (currentIndex !== -1) {
      if (playMode.value === 'order') {
        // 顺序播放：播放完最后一首就停止
        if (currentIndex < playlistOrder.value.length - 1) {
          playSong(playlistOrder.value[currentIndex + 1])
        } else {
          isPlaying.value = false
          console.log('顺序播放完成，停止播放')
        }
        return
      } else if (playMode.value === 'loop') {
        // 循环播放：播放完最后一首重新开始
        const nextIndex = (currentIndex + 1) % playlistOrder.value.length
        playSong(playlistOrder.value[nextIndex])
        return
      } else if (playMode.value === 'shuffle') {
        // 随机播放：播放完最后一首重新随机排序
        if (currentIndex < playlistOrder.value.length - 1) {
          playSong(playlistOrder.value[currentIndex + 1])
        } else {
          // 重新随机排序并开始播放
          const shuffled = [...originalPlaylistOrder.value].sort(() => Math.random() - 0.5)
          playlistOrder.value = shuffled
          playSong(shuffled[0])
          console.log('随机播放完成一轮，重新随机排序')
        }
        return
      }
    }
  }

  // 否则使用默认逻辑（主播放列表）
  if (playMode.value === 'order') {
    const currentIndex = playlist.value.findIndex(s => s.id === currentSong.value?.id)
    if (currentIndex !== -1 && currentIndex < playlist.value.length - 1) {
      playSong(playlist.value[currentIndex + 1])
    } else {
      isPlaying.value = false
    }
  } else {
    nextSong()
  }
}

// 关闭播放器（完全停止播放）
const closePlayer = () => {
  // 停止播放
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
    audioRef.value.currentTime = 0
  }

  // 重置播放状态
  isPlaying.value = false
  currentSong.value = null
  currentTime.value = 0
  duration.value = 0
  showPlayer.value = false

  // 清除播放列表状态
  currentPlayingPlaylist.value = null
  playlistOrder.value = []
  originalPlaylistOrder.value = []

  console.log('播放器已完全关闭')
}

// 隐藏播放器（不停止播放）
const hidePlayer = () => {
  showPlayer.value = false
  // 不暂停播放，音乐继续在后台播放
}

// 显示播放器
const showPlayerBar = () => {
  showPlayer.value = true
  showFullPlayer.value = true // 重新打开全屏播放器
}



// 处理删除歌曲
const handleDeleteSong = async (song) => {
  if (!confirm(`确定要删除歌曲 "${song.title}" 吗？此操作不可恢复。`)) {
    return
  }

  try {
    await deleteSong(song)
  } catch (error) {
    alert('删除歌曲失败，请重试')
  }
}

// 处理编辑歌曲
const handleEditSong = (song) => {
  editingSong.value = { ...song }
  showEditSongModal.value = true
}

// 保存编辑的歌曲信息
const handleSaveSong = (updatedSong) => {
  // 更新主播放列表中的歌曲
  const index = playlist.value.findIndex(song => song.id === updatedSong.id)
  if (index !== -1) {
    playlist.value[index] = updatedSong
  }

  // 更新所有歌单中的对应歌曲
  playlists.value.forEach(playlistItem => {
    const songIndex = playlistItem.songs.findIndex(song => song.id === updatedSong.id)
    if (songIndex !== -1) {
      playlistItem.songs[songIndex] = { ...updatedSong }
      console.log(`更新歌单 "${playlistItem.name}" 中的歌曲 "${updatedSong.title}"`)
    }
  })

  // 如果正在播放这首歌，更新当前歌曲信息
  if (currentSong.value && currentSong.value.id === updatedSong.id) {
    currentSong.value = updatedSong
  }

  // 如果当前正在播放某个歌单，更新歌单播放顺序中的歌曲信息
  if (currentPlayingPlaylist.value) {
    const playlistOrderIndex = playlistOrder.value.findIndex(song => song.id === updatedSong.id)
    if (playlistOrderIndex !== -1) {
      playlistOrder.value[playlistOrderIndex] = { ...updatedSong }
    }

    const originalOrderIndex = originalPlaylistOrder.value.findIndex(song => song.id === updatedSong.id)
    if (originalOrderIndex !== -1) {
      originalPlaylistOrder.value[originalOrderIndex] = { ...updatedSong }
    }
  }

  // 保存到本地存储
  savePlaylistToStorage()
  savePlaylistsToStorage()

  showEditSongModal.value = false
  editingSong.value = null

  console.log('歌曲信息已更新:', updatedSong.title)
}

// ========== 歌单管理功能 ==========

// 创建歌单
const createPlaylist = (playlistData) => {
  const newPlaylist = {
    id: generateId(),
    ...playlistData,
    songs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  playlists.value.push(newPlaylist)
  savePlaylistsToStorage()
  console.log('歌单创建成功:', newPlaylist.name)
}

// 更新歌单
const updatePlaylist = (updatedPlaylist) => {
  const index = playlists.value.findIndex(p => p.id === updatedPlaylist.id)
  if (index !== -1) {
    playlists.value[index] = {
      ...updatedPlaylist,
      updatedAt: new Date().toISOString()
    }
    savePlaylistsToStorage()
    console.log('歌单更新成功:', updatedPlaylist.name)
  }
}

// 删除歌单
const deletePlaylist = (playlist) => {
  const index = playlists.value.findIndex(p => p.id === playlist.id)
  if (index !== -1) {
    playlists.value.splice(index, 1)
    savePlaylistsToStorage()
    console.log('歌单删除成功:', playlist.name)
  }
}

// 打开歌单详情
const openPlaylist = (playlist) => {
  currentPlaylist.value = playlist
  currentView.value = 'playlist-detail'
}

// 返回歌单列表
const goBackToPlaylists = () => {
  currentPlaylist.value = null
  currentView.value = 'playlists'
}

// 编辑歌单
const editPlaylist = (playlist) => {
  // 这里可以触发编辑模态框
  console.log('编辑歌单:', playlist.name)
}

// 保存歌单到本地存储
const savePlaylistsToStorage = () => {
  try {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists.value))
  } catch (error) {
    console.error('保存歌单失败:', error)
  }
}

// 从本地存储加载歌单
const loadPlaylistsFromStorage = () => {
  try {
    const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY)
    if (stored) {
      playlists.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载歌单失败:', error)
    playlists.value = []
  }
}

// 将歌曲添加到歌单
const addSongToPlaylist = (song, playlist) => {
  // 检查歌曲是否已经在歌单中
  const isAlreadyInPlaylist = playlist.songs.some(s => s.id === song.id)

  if (isAlreadyInPlaylist) {
    alert(`歌曲 "${song.title}" 已经在歌单 "${playlist.name}" 中了`)
    return
  }

  // 添加歌曲到歌单
  const playlistIndex = playlists.value.findIndex(p => p.id === playlist.id)
  if (playlistIndex !== -1) {
    playlists.value[playlistIndex].songs.push(song)
    playlists.value[playlistIndex].updatedAt = new Date().toISOString()
    savePlaylistsToStorage()
    console.log(`歌曲 "${song.title}" 已添加到歌单 "${playlist.name}"`)
    alert(`歌曲 "${song.title}" 已成功添加到歌单 "${playlist.name}"`)
  }
}

// 从歌单移除歌曲
const removeSongFromPlaylist = (song) => {
  if (currentPlaylist.value) {
    const songIndex = currentPlaylist.value.songs.findIndex(s => s.id === song.id)
    if (songIndex !== -1) {
      currentPlaylist.value.songs.splice(songIndex, 1)

      // 更新playlists数组中的对应歌单
      const playlistIndex = playlists.value.findIndex(p => p.id === currentPlaylist.value.id)
      if (playlistIndex !== -1) {
        playlists.value[playlistIndex] = { ...currentPlaylist.value }
        savePlaylistsToStorage()
      }
    }
  }
}

// 顺序播放歌单（播放完就停止）
const playOrderFromPlaylist = (songs) => {
  if (songs.length > 0) {
    playMode.value = 'order'
    currentPlayingPlaylist.value = currentPlaylist.value
    playlistOrder.value = [...songs]
    originalPlaylistOrder.value = [...songs]
    playSong(songs[0])
    console.log('开始顺序播放歌单:', currentPlaylist.value?.name, '播放模式: 顺序')
  }
}

// 循环播放歌单（播放完继续循环）
const playLoopFromPlaylist = (songs) => {
  if (songs.length > 0) {
    playMode.value = 'loop'
    currentPlayingPlaylist.value = currentPlaylist.value
    playlistOrder.value = [...songs]
    originalPlaylistOrder.value = [...songs]
    playSong(songs[0])
    console.log('开始循环播放歌单:', currentPlaylist.value?.name, '播放模式: 循环')
  }
}

// 随机播放歌单（播放完继续随机）
const shufflePlayFromPlaylist = (songs) => {
  if (songs && songs.length > 0) {
    const songsToShuffle = Array.isArray(songs) ? songs : currentPlaylist.value?.songs || []

    if (songsToShuffle.length > 0) {
      playMode.value = 'shuffle'
      originalPlaylistOrder.value = [...songsToShuffle]
      const shuffled = [...songsToShuffle].sort(() => Math.random() - 0.5)
      currentPlayingPlaylist.value = currentPlaylist.value
      playlistOrder.value = shuffled
      playSong(shuffled[0])
      console.log('开始随机播放歌单:', currentPlaylist.value?.name, '播放模式: 随机')
    }
  }
}

// 兼容旧的函数名（用于向后兼容）
const playAllFromPlaylist = (songs) => {
  playLoopFromPlaylist(songs)
}

// 循环播放切换（保留用于兼容性）
const toggleLoop = () => {
  if (playMode.value === 'loop') {
    playMode.value = 'order'
  } else {
    playMode.value = 'loop'
  }
  console.log('播放模式切换为:', playMode.value === 'loop' ? '循环' : '顺序')
}

// 更新歌单中歌曲的顺序
const updatePlaylistSongOrder = (newOrder) => {
  if (currentPlaylist.value) {
    // 更新当前查看的歌单
    currentPlaylist.value.songs = newOrder

    // 更新playlists数组中的对应歌单
    const playlistIndex = playlists.value.findIndex(p => p.id === currentPlaylist.value.id)
    if (playlistIndex !== -1) {
      playlists.value[playlistIndex].songs = newOrder
      playlists.value[playlistIndex].updatedAt = new Date().toISOString()
      savePlaylistsToStorage()
    }

    // 如果当前正在播放这个歌单，更新播放顺序
    if (currentPlayingPlaylist.value?.id === currentPlaylist.value.id) {
      playlistOrder.value = newOrder
    }

    console.log('歌单顺序已更新:', currentPlaylist.value.name)
  }
}

// 处理侧边栏折叠状态变化
const handleSidebarCollapsed = (collapsed) => {
  isSidebarCollapsed.value = collapsed
}

// 处理导航
const handleNavigate = (view) => {
  currentView.value = view
}

// 获取视图标题
const getViewTitle = (view) => {
  const titles = {
    library: '我的音乐',
    favorites: '我喜欢的',
    recent: '随机歌曲',
    settings: '设置',
    'online-music': '在线音乐'
  }
  return titles[view] || '未知页面'
}

// 计算进度百分比
const progress = computed(() => {
  return duration.value ? (currentTime.value / duration.value) * 100 : 0
})

// 随机歌曲相关函数
// 从音乐库随机选择歌曲
const generateRandomSongs = () => {
  if (playlist.value.length === 0) {
    recentSongs.value = []
    return
  }

  // 创建播放列表的副本
  const availableSongs = [...playlist.value]
  const maxSongs = Math.min(15, availableSongs.length)
  const randomSongs = []

  // 随机抽取歌曲
  for (let i = 0; i < maxSongs; i++) {
    const randomIndex = Math.floor(Math.random() * availableSongs.length)
    randomSongs.push(availableSongs[randomIndex])
    // 移除已选择的歌曲，避免重复
    availableSongs.splice(randomIndex, 1)
  }

  recentSongs.value = randomSongs
  console.log(`生成了 ${randomSongs.length} 首随机歌曲`)
}

// 刷新随机歌曲列表
const refreshRecentSongs = () => {
  generateRandomSongs()
}

// 初始化随机歌曲列表
const initializeRecentSongs = () => {
  // 在播放列表加载完成后生成随机歌曲
  if (playlist.value.length > 0) {
    generateRandomSongs()
  }
}

// 文件上传处理
const handleFilesUploaded = async (files) => {
  console.log('接收到上传的文件:', files)
  const audioFiles = files.filter(f => f.type === 'audio')
  const imageFiles = files.filter(f => f.type === 'image')
  console.log('音频文件数量:', audioFiles.length, '图片文件数量:', imageFiles.length)

  try {
    // 初始化资源管理器
    await resourceManager.init()

    // 处理音频文件
    for (const fileInfo of audioFiles) {
      const songId = generateId()
      const songFileName = `uploaded_${songId}.${fileInfo.file.name.split('.').pop()}`

      // 保存音频文件到IndexedDB
      await resourceManager.saveFile(fileInfo.file, 'songs', songFileName)

      // 处理封面图片
      let coverFileName = null
      if (fileInfo.selectedCover) {
        const selectedCover = imageFiles.find(img => img.id === fileInfo.selectedCover)
        if (selectedCover) {
          const coverId = generateId()
          coverFileName = `uploaded_${coverId}.${selectedCover.file.name.split('.').pop()}`
          await resourceManager.saveFile(selectedCover.file, 'covers', coverFileName)

          // 立即缓存封面URL
          const coverUrl = URL.createObjectURL(selectedCover.file)
          coverUrlCache.value.set(coverFileName, coverUrl)
        }
      }

      // 处理歌词文件
      let lrcFileName = null
      if (fileInfo.lyricsContent) {
        const lrcId = generateId()
        lrcFileName = `lyrics_${lrcId}.lrc`

        // 将歌词内容转换为Blob并保存到IndexedDB
        const lrcBlob = new Blob([fileInfo.lyricsContent], { type: 'text/plain' })
        await resourceManager.saveFile(lrcBlob, 'lyrics', lrcFileName)
      }

      // 添加到播放列表
      const newSong = {
        id: parseInt(songId, 36),
        title: fileInfo.title.trim(),
        artist: fileInfo.artist.trim(),
        duration: fileInfo.duration,
        song: songFileName,
        cover: coverFileName,
        lrcFile: lrcFileName, // LRC歌词文件名
        isUploaded: true,
        isFavorite: false
      }

      console.log('创建的新歌曲对象:', newSong)
      console.log('歌词文件名:', newSong.lrcFile)

      playlist.value.push(newSong)
    }

    // 保存到本地存储
    savePlaylistToStorage()

    console.log('文件已保存到静态资源管理器')
  } catch (error) {
    console.error('文件保存失败:', error)
  }
}

// 删除单个歌曲
const deleteSong = async (song) => {
  try {
    // 如果是上传的文件，清理相关资源
    if (song.isUploaded) {
      // 清理文件URLs
      if (song.song && uploadedFiles.value.has(song.song)) {
        URL.revokeObjectURL(uploadedFiles.value.get(song.song))
        uploadedFiles.value.delete(song.song)
      }
      if (song.cover && uploadedFiles.value.has(song.cover)) {
        URL.revokeObjectURL(uploadedFiles.value.get(song.cover))
        uploadedFiles.value.delete(song.cover)
      }

      // 从IndexedDB删除文件
      if (song.song) {
        await resourceManager.deleteFile('songs', song.song)
      }
      if (song.cover) {
        await resourceManager.deleteFile('covers', song.cover)
      }
      if (song.lrc) {
        await resourceManager.deleteFile('lyrics', song.lrc)
      }
    }

    // 从主播放列表中移除
    const index = playlist.value.findIndex(s => s.id === song.id)
    if (index !== -1) {
      playlist.value.splice(index, 1)
    }

    // 从所有歌单中移除该歌曲
    playlists.value.forEach(playlistItem => {
      const songIndex = playlistItem.songs.findIndex(s => s.id === song.id)
      if (songIndex !== -1) {
        playlistItem.songs.splice(songIndex, 1)
        console.log(`从歌单 "${playlistItem.name}" 中移除歌曲 "${song.title}"`)
      }
    })

    // 如果删除的是当前播放的歌曲，停止播放
    if (currentSong.value?.id === song.id) {
      currentSong.value = null
      isPlaying.value = false
      if (audioRef.value) {
        audioRef.value.pause()
        audioRef.value.src = ''
      }
    }

    // 如果当前正在播放某个歌单，更新歌单播放顺序
    if (currentPlayingPlaylist.value) {
      const playlistOrderIndex = playlistOrder.value.findIndex(s => s.id === song.id)
      if (playlistOrderIndex !== -1) {
        playlistOrder.value.splice(playlistOrderIndex, 1)
      }

      const originalOrderIndex = originalPlaylistOrder.value.findIndex(s => s.id === song.id)
      if (originalOrderIndex !== -1) {
        originalPlaylistOrder.value.splice(originalOrderIndex, 1)
      }
    }

    // 保存到本地存储
    savePlaylistToStorage()
    savePlaylistsToStorage()

    console.log('歌曲已删除:', song.title)
  } catch (error) {
    console.error('删除歌曲失败:', error)
    throw error
  }
}

// 保存播放列表到本地存储
const savePlaylistToStorage = () => {
  const playlistData = playlist.value.map(song => ({
    ...song,
    // 不保存文件URLs，只保存文件名
    songUrl: song.isUploaded ? uploadedFiles.value.get(song.song) : null,
    coverUrl: song.isUploaded && song.cover ? uploadedFiles.value.get(song.cover) : null
  }))
  localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlistData))
}

// 从本地存储加载播放列表
const loadPlaylistFromStorage = async () => {
  try {
    const stored = localStorage.getItem(PLAYLIST_STORAGE_KEY)
    if (stored) {
      const playlistData = JSON.parse(stored)

      // 初始化资源管理器
      await resourceManager.init()

      for (const song of playlistData) {
        if (song.isUploaded) {
          // 异步加载封面URL
          if (song.cover && song.cover.startsWith('uploaded_')) {
            loadCoverUrl(song.cover)
          }
        }
        // 移除临时属性
        delete song.songUrl
        delete song.coverUrl

        // 确保有isFavorite属性
        if (song.isFavorite === undefined) {
          song.isFavorite = false
        }

        playlist.value.push(song)
      }
    }
  } catch (error) {
    console.error('加载播放列表失败:', error)
  }
}

// 键盘快捷键处理
const handleKeydown = (event) => {
  // 如果焦点在输入框中，不处理快捷键
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return
  }

  switch (event.code) {
    case 'Space':
      event.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (event.shiftKey) {
        // Shift + 左箭头：后退10秒
        seekToTime(Math.max(0, currentTime.value - 10))
      } else {
        // 左箭头：减少音量 (5%)
        const newVolume = Math.max(0, volume.value - 5)
        updateVolume(newVolume)
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (event.shiftKey) {
        // Shift + 右箭头：前进10秒
        seekToTime(Math.min(duration.value, currentTime.value + 10))
      } else {
        // 右箭头：增加音量 (5%)
        const newVolume = Math.min(100, volume.value + 5)
        updateVolume(newVolume)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      // 上箭头：增加音量 (5%)
      const newVolumeUp = Math.min(100, volume.value + 5)
      updateVolume(newVolumeUp)
      break
    case 'ArrowDown':
      event.preventDefault()
      // 下箭头：减少音量 (5%)
      const newVolumeDown = Math.max(0, volume.value - 5)
      updateVolume(newVolumeDown)
      break
    case 'KeyF':
      if (event.ctrlKey) {
        event.preventDefault()
        // Ctrl+F：打开搜索
        showSearchModal.value = true
      }
      break
    case 'Escape':
      event.preventDefault()
      // ESC：清除搜索或关闭模态框
      if (isSearching.value) {
        clearSearch()
      }
      break
    case 'KeyJ':
      event.preventDefault()
      // J：后退10秒
      seekTo(Math.max(0, currentTime.value - 10))
      break
    case 'KeyL':
      event.preventDefault()
      // L：前进10秒
      seekTo(Math.min(duration.value, currentTime.value + 10))
      break
    case 'KeyK':
      event.preventDefault()
      // K：播放/暂停
      togglePlay()
      break
    case 'KeyM':
      event.preventDefault()
      // M：静音/取消静音
      toggleMute()
      break
    case 'KeyP':
      event.preventDefault()
      // P：切换全屏播放器
      if (currentSong.value) {
        toggleFullscreen()
      }
      break
    case 'Comma':
      if (event.shiftKey) {
        event.preventDefault()
        // Shift + ,：减慢播放速度
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
        const currentIndex = rates.indexOf(playbackRate.value)
        if (currentIndex > 0) {
          setPlaybackRate(rates[currentIndex - 1])
        }
      }
      break
    case 'Period':
      if (event.shiftKey) {
        event.preventDefault()
        // Shift + .：加快播放速度
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
        const currentIndex = rates.indexOf(playbackRate.value)
        if (currentIndex < rates.length - 1) {
          setPlaybackRate(rates[currentIndex + 1])
        }
      }
      break
    case 'Slash':
      if (event.shiftKey) {
        event.preventDefault()
        // Shift + /（即 ?）：显示快捷键帮助
        showKeyboardShortcuts.value = true
      }
      break
  }
}

// 组件挂载时加载播放列表和主题
onMounted(async () => {
  // 初始化主题
  await loadTheme()

  await loadPlaylistFromStorage()
  loadPlaylistsFromStorage()

  // 初始化随机歌曲列表
  initializeRecentSongs()

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 监听播放列表变化，自动保存
watch(playlist, () => {
  if (playlist.value.length > 0) {
    savePlaylistToStorage()
    // 当播放列表变化时，更新随机歌曲列表
    generateRandomSongs()
  } else {
    // 如果播放列表为空，清空随机歌曲
    recentSongs.value = []
  }
}, { deep: true })

// 处理资源变化
const handleAssetsChanged = () => {
  // 当资源被删除时，可能需要更新播放列表
  // 这里可以添加更多逻辑来处理资源变化
  console.log('静态资源已更改')
}

// 格式化时间显示
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 计算进度百分比
const progressPercentage = computed(() => {
  if (!duration.value || duration.value === 0) return 0
  return Math.min((currentTime.value / duration.value) * 100, 100)
})

// 进度条点击处理
const progressContainer = ref(null)
const handleProgressClick = (event) => {
  if (!progressContainer.value || !duration.value) return

  const rect = progressContainer.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, clickX / rect.width)) // 确保在0-1之间

  seekTo(percentage) // seekTo期望0-1之间的值
}

// 音量滑块点击处理
const volumeSlider = ref(null)
const handleVolumeClick = (event) => {
  if (!volumeSlider.value) return

  const rect = volumeSlider.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100))

  updateVolume(percentage)
  if (isMuted.value && percentage > 0) {
    toggleMute()
  }
}

// 歌词相关
const lyricsContainer = ref(null)
const lyricsScroll = ref(null)
const currentLyricIndex = ref(-1)
const parsedLyrics = ref([])

// 是否有歌词
const hasLyrics = computed(() => {
  return currentSong.value?.lrcFile && parsedLyrics.value.length > 0
})

// 解析LRC歌词
const parseLRC = (lrcText) => {
  if (!lrcText) return []

  const lines = lrcText.split('\n')
  const lyrics = []

  lines.forEach((line) => {
    // 清理行内容，移除回车符
    const cleanLine = line.replace(/\r/g, '').trim()

    // 匹配时间标签 [mm:ss:xx] 或 [mm:ss.xx] 或 [mm:ss]
    const match = cleanLine.match(/\[(\d{2}):(\d{2}):(\d{2})\](.*)/) || cleanLine.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/)
    if (match) {
      let minutes, seconds, milliseconds, text

      if (match[0].includes(':') && match[3] && !match[3].includes('.')) {
        // [mm:ss:xx] 格式，第三个数字是毫秒的十位
        minutes = parseInt(match[1])
        seconds = parseInt(match[2])
        milliseconds = parseInt(match[3]) * 10 // 转换为毫秒
        text = match[4].trim()
      } else {
        // [mm:ss.xx] 或 [mm:ss] 格式
        minutes = parseInt(match[1])
        seconds = parseInt(match[2])
        milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0
        text = match[4].trim()
      }

      const time = minutes * 60 + seconds + milliseconds / 1000

      if (text) { // 只添加有文本的行
        lyrics.push({ time, text })
      }
    }
  })

  return lyrics.sort((a, b) => a.time - b.time)
}

// 根据当前时间找到对应的歌词行
const findCurrentLyricIndex = (currentTime) => {
  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (currentTime >= parsedLyrics.value[i].time) {
      return i
    }
  }
  return -1
}

// 滚动到当前歌词 - 精确居中
const scrollToCurrentLyric = async (index) => {
  if (!lyricsScroll.value || index < 0 || !parsedLyrics.value.length) return

  await nextTick()

  const currentLine = lyricsScroll.value.querySelector(`[data-lyric-index="${index}"]`)
  if (currentLine && lyricsScroll.value) {
    const container = lyricsScroll.value
    const containerHeight = container.clientHeight

    // 计算当前行在容器中的相对位置
    const lineTopInContainer = currentLine.offsetTop
    const lineHeight = currentLine.clientHeight

    // 计算目标滚动位置：让当前行位于容器的中心
    const targetScrollTop = lineTopInContainer - (containerHeight / 2) + (lineHeight / 2)

    // 检查是否需要滚动（避免不必要的滚动）
    const currentScrollTop = container.scrollTop
    const scrollDifference = Math.abs(currentScrollTop - targetScrollTop)

    // 只有当滚动差异大于10px时才进行滚动
    if (scrollDifference > 10) {
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })
    }
  }
}

// 点击歌词跳转到对应时间
const seekToLyric = (time) => {
  seekToTime(time)
}

// 从IndexedDB加载歌词文件
const loadLyricsFromDB = async (lrcFileName) => {
  try {
    if (!lrcFileName || !resourceManager) {
      return ''
    }

    const lrcBlob = await resourceManager.getFileBlob('lyrics', lrcFileName)
    if (lrcBlob) {
      return await lrcBlob.text()
    }
    return ''
  } catch (error) {
    console.error('加载歌词文件失败:', error)
    return ''
  }
}

// 关闭全屏播放器并停止播放
const closeFullPlayer = () => {
  showFullPlayer.value = false

  // 停止播放
  if (audioRef.value) {
    audioRef.value.pause()
    isPlaying.value = false
  }

  // 重置播放状态
  currentSong.value = null
  currentTime.value = 0
  duration.value = 0
}

// 最小化播放器（只隐藏弹窗，音乐继续播放）
const minimizePlayer = () => {
  showFullPlayer.value = false
  showPlayer.value = false // 隐藏播放器，显示小播放器
}

// 监听歌曲变化，加载歌词
watch(() => currentSong.value?.lrcFile, async (newLrcFile) => {
  if (newLrcFile) {
    const lyricsContent = await loadLyricsFromDB(newLrcFile)
    parsedLyrics.value = parseLRC(lyricsContent)
  } else {
    parsedLyrics.value = []
  }
  currentLyricIndex.value = -1

  // 重置滚动位置到顶部
  await nextTick()
  if (lyricsScroll.value) {
    lyricsScroll.value.scrollTop = 0
  }
}, { immediate: true })

// 监听播放时间变化，更新歌词
watch(() => currentTime.value, (newTime) => {
  if (!hasLyrics.value) return

  const newIndex = findCurrentLyricIndex(newTime)
  if (newIndex !== currentLyricIndex.value) {
    currentLyricIndex.value = newIndex
    scrollToCurrentLyric(newIndex)
  }
})

// 监听歌曲变化，重置歌词状态
watch(() => currentSong.value, () => {
  currentLyricIndex.value = -1
  if (lyricsScroll.value) {
    lyricsScroll.value.scrollTop = 0
  }
})

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  min-height: 100vh;
  padding-bottom: 100px; /* 为播放器留出空间 */
  color: #1e293b;
}

.app {
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 20px 30px;
  padding-bottom: 220px; /* 为歌词组件留出空间 */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.sidebar-collapsed {
  margin-left: 0;
}

/* 当播放器显示时，调整底部边距 */
.main-content.player-visible {
  padding-bottom: 310px; /* 歌词组件 + 播放器高度 */
}

/* 视图容器样式 */
.library-view,
.favorites-view,
.playlists-view,
.playlist-detail-view,
.other-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 开发中页面样式 */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
  flex: 1;
}

.coming-soon-icon {
  font-size: 120px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.coming-soon h3 {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  font-weight: 600;
}

.coming-soon p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  max-width: 400px;
  line-height: 1.6;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.content-header h1 {
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.8);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.add-music-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-music-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(40, 167, 69, 0.4);
}

/* 侧边栏底部控制按钮 */
.bottom-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  width: 100%;
  text-align: left;
}

.control-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateX(4px);
}

.control-icon {
  font-size: 16px;
  min-width: 20px;
  text-align: center;
}

.control-text {
  font-weight: 500;
}

.btn-icon {
  font-size: 16px;
}

.content-body {
  flex: 1;
  overflow-y: auto;
}



.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 40px;
  color: rgba(0, 0, 0, 0.7);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.4;
}

.empty-state h3 {
  color: #1e293b;
  font-size: 1.5rem;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
  opacity: 0.8;
  line-height: 1.5;
}

.empty-add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 200px;
    padding: 20px;
  }

  .content-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .content-header h1 {
    font-size: 1.8rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .add-music-btn,
  .refresh-btn {
    padding: 10px 16px;
    font-size: 13px;
  }

  .empty-state {
    padding: 60px 20px;
    min-height: 300px;
  }

  .empty-icon {
    font-size: 60px;
  }

  .empty-state h3 {
    font-size: 1.3rem;
  }

  .empty-state p {
    font-size: 14px;
  }

  .empty-add-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }

  .content-header h1 {
    font-size: 1.5rem;
  }

  .add-music-btn,
  .refresh-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .empty-state {
    padding: 40px 15px;
    min-height: 250px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-state h3 {
    font-size: 1.2rem;
  }
}

/* 显示播放栏的浮动按钮 */
.show-player-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.show-player-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--color-primary);
}

.mini-player-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.mini-cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.mini-details {
  flex: 1;
  min-width: 0;
}

.mini-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.mini-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mini-play-btn,
.show-up-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mini-play-btn:hover,
.show-up-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.show-up-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.show-up-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .show-player-btn {
    bottom: 15px;
    right: 15px;
    max-width: 250px;
    padding: 10px 12px;
  }

  .mini-cover {
    width: 36px;
    height: 36px;
  }

  .mini-title {
    font-size: 13px;
  }

  .mini-artist {
    font-size: 11px;
  }

  .mini-play-btn,
  .show-up-btn {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .show-player-btn {
    bottom: 10px;
    right: 10px;
    max-width: 200px;
    padding: 8px 10px;
  }

  .mini-cover {
    width: 32px;
    height: 32px;
  }

  .mini-controls {
    gap: 6px;
  }

  .mini-play-btn,
  .show-up-btn {
    width: 28px;
    height: 28px;
  }
}

/* 全屏播放器样式 */
.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
}

.fullscreen-content {
  width: 90%;
  max-width: 1200px;
  height: 85%;
  background: var(--bg-surface);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.player-main {
  flex: 1;
  display: flex;
  gap: 48px;
  min-height: 0;
  margin-top: 20px;
}

/* CD区域样式 */
.cd-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.cd-container {
  position: relative;
  width: 350px;
  height: 350px;
}

.cd-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: linear-gradient(45deg, #333, #666);
  box-shadow:
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 0 12px rgba(0, 0, 0, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  overflow: hidden;
}

.cd-disc.spinning {
  animation: spin 15s linear infinite;
}

.cd-cover {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.song-info {
  text-align: center;
  max-width: 320px;
}

.song-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.song-artist {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0;
}

/* 歌词区域样式 */
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  min-height: 0;
}

.lyrics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

/* 底部控制栏 */
.fullscreen-controls {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 控制栏样式 */
.control-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.song-display {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.control-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.control-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.control-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 24px;
}

.favorite-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.favorite-btn.is-favorite {
  color: #ff4757;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.playback-controls button {
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

.playback-controls button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.playback-controls button.active {
  color: var(--color-primary);
}

.play-btn {
  background: var(--color-primary) !important;
  color: white !important;
  width: 48px !important;
  height: 48px !important;
}

.play-btn:hover {
  background: var(--color-primary-dark) !important;
  transform: scale(1.05);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 200px;
}

.time-display {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}

.progress-container {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  z-index: 1;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.1s ease;
  max-width: 100%;
  z-index: 2;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-container:hover .progress-thumb {
  opacity: 1;
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.volume-section button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.volume-section button:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.volume-slider {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.volume-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  z-index: 1;
}

.volume-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.1s ease;
  max-width: 100%;
  z-index: 2;
}

.volume-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.volume-slider:hover .volume-thumb {
  opacity: 1;
}

/* 歌词区域样式 */
.lyrics-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 40px;
}

.lyrics-container {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.lyrics-scroll {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  /* 添加适量的上下内边距，确保第一行和最后一行也能居中 */
  padding-top: 200px;
  padding-bottom: 200px;
}

.lyric-line {
  padding: 12px 0;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  text-align: center;
  margin: 4px 0;
}

.lyric-line:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.lyric-line.current {
  color: var(--color-primary);
  font-weight: 600;
  background: rgba(var(--color-primary-rgb), 0.1);
  transform: scale(1.02);
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.lyric-line.passed {
  color: rgba(255, 255, 255, 0.4);
  opacity: 0.7;
}

.no-lyrics {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.no-lyrics-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-lyrics p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.add-lyrics-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-lyrics-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* 自定义滚动条 */
.lyrics-scroll::-webkit-scrollbar {
  width: 6px;
}

.lyrics-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.lyrics-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.lyrics-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>