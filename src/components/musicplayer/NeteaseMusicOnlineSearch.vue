<template>
  <div class="netease-online-container">
    <div class="online-header">
      <div class="header-info">
        <div class="info-icon">🎵</div>
        <div class="info-content">
          <h3>网易云音乐在线搜索</h3>
          <p>在线搜索并下载网易云音乐到本地音乐库</p>
        </div>
      </div>
      <div class="status-container">
        <div class="api-status" :class="{ 'online': apiOnline, 'offline': !apiOnline }">
          <span class="status-dot"></span>
          <span class="status-text">{{ apiOnline ? 'API在线' : 'API离线' }}</span>
        </div>
        <div class="vip-status" :class="{
          vip: vipStatus.isVip,
          black: vipStatus.isBlackVip,
          super: vipStatus.isSuperVip
        }">
          <span v-if="vipStatus.isLogin">
            👤 {{ vipStatus.nickname }}
            <span v-if="vipStatus.isSuperVip" class="vip-badge super">黑胶SVIP</span>
            <span v-else-if="vipStatus.isBlackVip" class="vip-badge black">黑胶VIP</span>
            <span v-else-if="vipStatus.isVip" class="vip-badge normal">VIP</span>
            <span v-else class="vip-badge free">免费用户</span>
            <button @click="logout" class="logout-btn" title="退出登录">🚪</button>
          </span>
          <span v-else class="guest">
            👤 游客模式
            <button @click="showLoginModal = true" class="login-btn">登录</button>
          </span>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-input-container">
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          @input="handleSearchInput"
          @keyup.enter="performSearch"
          placeholder="搜索歌曲、艺术家或专辑..."
          class="search-input"
          :disabled="!apiOnline"
        />
        <button 
          class="search-btn" 
          @click="performSearch"
          :disabled="!searchQuery.trim() || searching || !apiOnline"
        >
          <div v-if="searching" class="loading-spinner small"></div>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
          </svg>
        </button>
        <button 
          v-if="searchQuery" 
          class="clear-btn" 
          @click="clearSearch"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- 搜索建议 -->
      <div v-if="searchSuggestions.length > 0 && showSuggestions" class="search-suggestions">
        <div
          v-for="suggestion in searchSuggestions"
          :key="suggestion.id"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          <span class="suggestion-type">{{ suggestion.type === 'song' ? '🎵' : '👤' }}</span>
          <span class="suggestion-text">{{ suggestion.name }}</span>
          <span v-if="suggestion.artist" class="suggestion-artist">- {{ suggestion.artist }}</span>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="!searchQuery && hotKeywords.length > 0" class="hot-search">
        <h4>热门搜索</h4>
        <div class="hot-keywords">
          <button
            v-for="keyword in hotKeywords"
            :key="keyword"
            class="hot-keyword"
            @click="searchQuery = keyword; performSearch()"
          >
            {{ keyword }}
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <h4>搜索结果 ({{ searchResults.length }} 首歌曲)</h4>
        <div class="results-actions">
          <button class="action-btn" @click="selectAllSongs">
            {{ selectedSongs.size === searchResults.length ? '取消全选' : '全选' }}
          </button>
          <button 
            class="action-btn primary"
            @click="downloadSelected"
            :disabled="selectedSongs.size === 0 || downloading"
          >
            <div v-if="downloading" class="loading-spinner small"></div>
            下载选中 ({{ selectedSongs.size }})
          </button>
        </div>
      </div>

      <div class="song-list">
        <div
          v-for="song in searchResults"
          :key="song.id"
          class="song-item"
          :class="{ selected: selectedSongs.has(song.id) }"
          @click="toggleSongSelection(song.id)"
        >
          <div class="song-checkbox">
            <input 
              type="checkbox" 
              :checked="selectedSongs.has(song.id)"
              @change="toggleSongSelection(song.id)"
            />
          </div>
          <div class="song-cover">
            <img
              :src="song.cover || defaultCoverSvg"
              :alt="song.name"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </div>
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-details">
              <span class="song-artist">{{ song.artist }}</span>
              <span class="song-album">{{ song.album }}</span>
              <span class="song-duration">{{ formatDuration(song.duration) }}</span>
            </div>
          </div>
          <div class="song-actions">
            <button 
              class="action-btn download-btn"
              @click.stop="downloadSong(song)"
              :disabled="downloading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
              </svg>
              下载
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 下载进度 -->
    <div v-if="downloading" class="download-progress">
      <div class="progress-info">
        <span>正在下载: {{ currentDownloadSong }}</span>
        <span>进度: {{ downloadedCount }} / {{ selectedSongs.size }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (downloadedCount / selectedSongs.size) * 100 + '%' }"></div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="usage-info">
      <div class="info-card">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <h4>使用说明</h4>
          <ul>
            <li>确保网易云音乐API服务正在运行</li>
            <li>搜索您喜欢的歌曲、艺术家或专辑</li>
            <li>选择要下载的歌曲，点击下载按钮</li>
            <li>下载的音乐将自动保存到本地音乐库</li>
            <li>支持批量下载和歌词获取</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 登录模态框 -->
    <div v-if="showLoginModal" class="login-modal-overlay" @click="closeLoginModal">
      <div class="login-modal" @click.stop>
        <div class="login-header">
          <h3>🎵 网易云音乐登录</h3>
          <button @click="closeLoginModal" class="close-btn">×</button>
        </div>

        <div class="login-content">
          <div class="login-step">
            <div class="login-options">
              <div class="option-card">
                <h4>🔗 浏览器登录（推荐）</h4>
                <p>在浏览器中登录网易云音乐，然后手动配置Cookie</p>
                <button @click="openBrowserLogin" class="browser-login-btn">
                  打开登录页面
                </button>
              </div>

              <div class="option-card">
                <h4>📱 二维码登录</h4>
                <p>使用网易云音乐APP扫描二维码登录</p>
                <button @click="generateQR" class="generate-qr-btn" :disabled="generatingQR">
                  {{ generatingQR ? '生成中...' : '生成二维码' }}
                </button>
              </div>
            </div>

            <div v-if="qrData.unikey" class="qr-login-step">
              <div class="qr-container">
                <div v-if="qrData.qrImage" class="qr-display">
                  <img :src="qrData.qrImage" alt="登录二维码" class="qr-image" @error="handleQRError">
                  <div v-if="qrImageError" class="qr-fallback">
                    <div class="qr-text">二维码加载失败</div>
                    <div class="qr-link">
                      <p>请复制以下链接到浏览器打开：</p>
                      <input :value="qrData.qrUrl" readonly class="qr-url-input" @click="copyQRUrl">
                      <button @click="copyQRUrl" class="copy-btn">复制链接</button>
                    </div>
                  </div>
                </div>
                <div v-else class="qr-placeholder">二维码生成中...</div>
              </div>

              <div class="login-instructions">
                <p>📱 请使用网易云音乐APP扫描二维码</p>
                <p class="login-status" :class="loginStatus.type">{{ loginStatus.message }}</p>

                <!-- 验证码处理界面 -->
                <div v-if="loginStatus.type === 'captcha'" class="captcha-section">
                  <div class="captcha-notice">
                    <p class="captcha-warning">⚠️ 需要完成安全验证</p>
                    <p class="captcha-tip">请在浏览器中完成人机验证后重试登录</p>
                  </div>
                  <div class="captcha-actions">
                    <button @click="openCaptchaPage" class="captcha-btn">🌐 打开登录页面</button>
                    <button @click="retryCaptchaLogin" class="retry-btn">✅ 验证完成，重试</button>
                    <button @click="showManualCookieHelp" class="manual-help-btn">📋 手动获取Cookie</button>
                  </div>

                  <!-- 手动Cookie帮助 -->
                  <div v-if="showCookieHelp" class="cookie-help-section">
                    <h5>🔧 手动获取Cookie方法：</h5>
                    <ol class="cookie-help-steps">
                      <li>在新窗口中登录 <a href="https://music.163.com" target="_blank">music.163.com</a></li>
                      <li>登录成功后，按 <kbd>F12</kbd> 打开开发者工具</li>
                      <li>切换到 <strong>Application</strong> 或 <strong>存储</strong> 标签</li>
                      <li>在左侧找到 <strong>Cookies</strong> → <strong>https://music.163.com</strong></li>
                      <li>找到名为 <strong>MUSIC_U</strong> 的Cookie，复制其值</li>
                      <li>将Cookie值粘贴到下方的手动Cookie输入框中</li>
                    </ol>
                    <button @click="showCookieHelp = false" class="close-help-btn">关闭帮助</button>
                  </div>
                </div>
              </div>

              <div class="login-actions">
                <button @click="generateQR" class="refresh-qr-btn">刷新二维码</button>
                <button @click="closeLoginModal" class="cancel-btn">取消</button>
              </div>
            </div>

            <div class="manual-cookie-section">
              <h4>🔧 手动配置Cookie</h4>
              <p>如果自动登录失败，您可以手动配置Cookie：</p>
              <ol class="cookie-steps">
                <li>在浏览器中登录 <a href="https://music.163.com" target="_blank">music.163.com</a></li>
                <li>按F12打开开发者工具 → Network标签</li>
                <li>刷新页面，找到任意请求，复制Cookie中的MUSIC_U值</li>
                <li>将Cookie粘贴到下方输入框：</li>
              </ol>
              <div class="cookie-input-section">
                <textarea
                  v-model="manualCookie"
                  placeholder="MUSIC_U=你的值;os=pc;appver=8.9.70;"
                  class="cookie-input"
                  rows="3"
                ></textarea>
                <button @click="updateManualCookie" class="update-cookie-btn" :disabled="!manualCookie.trim()">
                  更新Cookie
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
import { ref, computed, onMounted } from 'vue'
import { neteaseMusicService } from '@/services/neteaseMusic.js'
import { resourceManager, generateId, formatFileSize } from '@/utils/fileUtils'

const emit = defineEmits(['songs-imported'])

// 默认音乐封面SVG
const defaultCoverSvg = 'data:image/svg+xml;base64,' + btoa(`
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="8" fill="#374151"/>
  <circle cx="32" cy="32" r="20" fill="#6B7280"/>
  <circle cx="32" cy="32" r="12" fill="#374151"/>
  <circle cx="32" cy="32" r="4" fill="#9CA3AF"/>
  <path d="M28 24L36 32L28 40V24Z" fill="#9CA3AF"/>
</svg>
`)

// 处理图片加载错误
const handleImageError = (event) => {
  const currentSrc = event.target.src
  console.warn('封面图片加载失败:', currentSrc)

  // 如果是网易云封面URL，尝试其他域名
  if (currentSrc.includes('music.126.net') && !event.target.dataset.retried) {
    event.target.dataset.retried = 'true'

    // 尝试不同的域名
    if (currentSrc.includes('p1.music.126.net')) {
      event.target.src = currentSrc.replace('p1.music.126.net', 'p2.music.126.net')
      return
    } else if (currentSrc.includes('p2.music.126.net')) {
      event.target.src = currentSrc.replace('p2.music.126.net', 'p3.music.126.net')
      return
    } else if (currentSrc.includes('p3.music.126.net')) {
      event.target.src = currentSrc.replace('p3.music.126.net', 'p4.music.126.net')
      return
    }
  }

  // 最终回退到默认封面
  if (!currentSrc.includes('data:image')) {
    event.target.src = defaultCoverSvg
  }
}

// 处理图片加载成功
const handleImageLoad = (event) => {
  console.log('封面图片加载成功:', event.target.src)
}

// 响应式数据
const searchQuery = ref('')
const searchResults = ref([])
const selectedSongs = ref(new Set())
const searching = ref(false)
const downloading = ref(false)
const currentDownloadSong = ref('')
const downloadedCount = ref(0)
const apiOnline = ref(false)
const searchSuggestions = ref([])
const showSuggestions = ref(false)
const hotKeywords = ref([])
const searchInput = ref(null)
const vipStatus = ref({
  isLogin: false,
  vipType: 0,
  isVip: false,
  isBlackVip: false,
  isSuperVip: false,
  nickname: '游客'
})

// 登录相关
const showLoginModal = ref(false)
const generatingQR = ref(false)
const qrData = ref({
  unikey: '',
  qrUrl: '',
  qrImage: ''
})
const loginStatus = ref({
  type: 'info',
  message: '等待扫码...'
})
const qrImageError = ref(false)
const manualCookie = ref('')
let loginCheckInterval = null

// 检查API状态
const checkApiStatus = async () => {
  try {
    apiOnline.value = await neteaseMusicService.checkStatus()
    if (apiOnline.value) {
      // API在线时检查VIP状态
      await checkVipStatus()
    }
  } catch (error) {
    console.error('检查API状态失败:', error)
    apiOnline.value = false
  }
}

// 检查VIP状态
const checkVipStatus = async () => {
  try {
    const response = await fetch('http://localhost:3000/vip-status')
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        vipStatus.value = result.data
        console.log('🎵 用户状态:', vipStatus.value)
      }
    }
  } catch (error) {
    console.warn('⚠️ VIP状态检查失败:', error.message)
  }
}

// 生成二维码
const generateQR = async () => {
  try {
    generatingQR.value = true

    // 清除之前的检查定时器
    if (loginCheckInterval) {
      clearInterval(loginCheckInterval)
      loginCheckInterval = null
    }

    const response = await fetch('http://localhost:3000/qr-login/generate')
    const result = await response.json()

    if (result.success) {
      qrData.value = result.data
      qrImageError.value = false

      // 使用多个二维码生成服务作为备选
      const qrServices = [
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.data.qrUrl)}`,
        `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(result.data.qrUrl)}`,
        `https://qr-server.com/api/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.data.qrUrl)}`
      ]

      // 使用第一个服务
      qrData.value.qrImage = qrServices[0]

      loginStatus.value = {
        type: 'info',
        message: '请使用网易云音乐APP扫描二维码'
      }

      // 开始检查登录状态
      startLoginCheck()
    } else {
      loginStatus.value = {
        type: 'error',
        message: '生成二维码失败，请重试'
      }
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    loginStatus.value = {
      type: 'error',
      message: '网络错误，请检查API服务'
    }
  } finally {
    generatingQR.value = false
  }
}

// 开始检查登录状态
const startLoginCheck = () => {
  loginCheckInterval = setInterval(async () => {
    try {
      const response = await fetch('http://localhost:3000/qr-login/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ unikey: qrData.value.unikey })
      })

      const result = await response.json()

      if (result.status === 'waiting') {
        loginStatus.value = {
          type: 'info',
          message: '等待扫码...'
        }
      } else if (result.status === 'scanned') {
        loginStatus.value = {
          type: 'warning',
          message: '已扫码，请在手机上确认登录'
        }
      } else if (result.status === 'success') {
        loginStatus.value = {
          type: 'success',
          message: '登录成功！正在更新状态...'
        }

        // 停止检查
        clearInterval(loginCheckInterval)
        loginCheckInterval = null

        // 重新检查VIP状态
        setTimeout(async () => {
          await checkVipStatus()
          closeLoginModal()
        }, 1000)

      } else if (result.status === 'expired') {
        loginStatus.value = {
          type: 'error',
          message: '二维码已过期，请重新生成'
        }
        clearInterval(loginCheckInterval)
        loginCheckInterval = null
      } else if (result.status === 'captcha' || (result.message && result.message.includes('验证码'))) {
        loginStatus.value = {
          type: 'captcha',
          message: '需要完成安全验证才能登录'
        }
        clearInterval(loginCheckInterval)
        loginCheckInterval = null
      } else {
        loginStatus.value = {
          type: 'error',
          message: result.message || '登录失败'
        }
        clearInterval(loginCheckInterval)
        loginCheckInterval = null
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  }, 2000) // 每2秒检查一次
}

// 关闭登录模态框
const closeLoginModal = () => {
  showLoginModal.value = false

  // 清除检查定时器
  if (loginCheckInterval) {
    clearInterval(loginCheckInterval)
    loginCheckInterval = null
  }

  // 重置数据
  qrData.value = {
    unikey: '',
    qrUrl: '',
    qrImage: ''
  }
  loginStatus.value = {
    type: 'info',
    message: '等待扫码...'
  }
  qrImageError.value = false
}

// 处理二维码图片加载错误
const handleQRError = () => {
  console.warn('二维码图片加载失败，尝试备用服务')

  // 备用二维码生成服务
  const qrServices = [
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.value.qrUrl)}`,
    `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(qrData.value.qrUrl)}`,
    `https://qr.liantu.com/api.php?text=${encodeURIComponent(qrData.value.qrUrl)}`
  ]

  // 检查当前使用的是哪个服务
  const currentImage = qrData.value.qrImage
  let nextServiceIndex = 0

  // 找到下一个可用的服务
  for (let i = 0; i < qrServices.length; i++) {
    if (currentImage.includes('qrserver.com') && i === 0) continue
    if (currentImage.includes('googleapis.com') && i === 1) continue
    if (currentImage.includes('liantu.com') && i === 2) continue

    nextServiceIndex = i
    break
  }

  // 如果还有备用服务，尝试使用
  if (nextServiceIndex < qrServices.length && !currentImage.includes(qrServices[nextServiceIndex])) {
    console.log(`尝试备用二维码服务 ${nextServiceIndex + 1}`)
    qrData.value.qrImage = qrServices[nextServiceIndex]
  } else {
    // 所有服务都失败了，显示备用方案
    console.warn('所有二维码服务都失败，显示文本链接')
    qrImageError.value = true
  }
}

// 复制二维码链接
const copyQRUrl = async () => {
  try {
    await navigator.clipboard.writeText(qrData.value.qrUrl)
    loginStatus.value = {
      type: 'success',
      message: '链接已复制到剪贴板！请在浏览器中打开'
    }

    // 3秒后恢复原状态
    setTimeout(() => {
      loginStatus.value = {
        type: 'info',
        message: '等待登录确认...'
      }
    }, 3000)
  } catch (error) {
    console.error('复制失败:', error)
    loginStatus.value = {
      type: 'error',
      message: '复制失败，请手动复制链接'
    }
  }
}

// 打开浏览器登录
const openBrowserLogin = () => {
  window.open('https://music.163.com', '_blank')
  loginStatus.value = {
    type: 'info',
    message: '请在新打开的页面中登录，然后手动配置Cookie'
  }
}

// 更新手动Cookie
const updateManualCookie = async () => {
  try {
    const cookie = manualCookie.value.trim()
    if (!cookie) {
      loginStatus.value = {
        type: 'error',
        message: 'Cookie不能为空'
      }
      return
    }

    const response = await fetch('http://localhost:3000/update-cookie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cookie })
    })

    const result = await response.json()

    if (result.success) {
      loginStatus.value = {
        type: 'success',
        message: 'Cookie更新成功！正在检查登录状态...'
      }

      // 重新检查VIP状态
      setTimeout(async () => {
        await checkVipStatus()
        closeLoginModal()
      }, 1000)
    } else {
      loginStatus.value = {
        type: 'error',
        message: result.error || 'Cookie更新失败'
      }
    }
  } catch (error) {
    console.error('更新Cookie失败:', error)
    loginStatus.value = {
      type: 'error',
      message: '网络错误，请检查API服务'
    }
  }
}

// 退出登录
const logout = async () => {
  try {
    // 确认退出
    if (!confirm('确定要退出登录吗？退出后将无法下载VIP歌曲。')) {
      return
    }

    const response = await fetch('http://localhost:3000/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (result.success) {
      // 重置VIP状态
      vipStatus.value = {
        isLogin: false,
        vipType: 0,
        isVip: false,
        isBlackVip: false,
        isSuperVip: false,
        nickname: '游客'
      }

      // 清空手动Cookie输入
      manualCookie.value = ''

      // 显示成功消息
      ElMessage.success('已成功退出登录')

      console.log('🚪 已退出登录')
    } else {
      ElMessage.error(result.error || '退出登录失败')
    }
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('网络错误，请检查API服务')
  }
}

// 打开验证码页面
const openCaptchaPage = () => {
  // 打开网易云音乐登录页面
  const captchaUrl = 'https://music.163.com/login'
  window.open(captchaUrl, '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes')

  loginStatus.value = {
    type: 'info',
    message: '请在新窗口中登录网易云账号。如果出现验证码，请完成验证后点击"验证完成，重试"'
  }
}

// 验证完成后重试登录
const retryCaptchaLogin = async () => {
  loginStatus.value = {
    type: 'info',
    message: '正在重新生成二维码...'
  }

  // 重新生成二维码
  await generateQR()
}

// 获取热门搜索
const getHotSearch = async () => {
  try {
    const result = await neteaseMusicService.getHotSearch()
    if (result.success) {
      hotKeywords.value = result.keywords.slice(0, 10) // 只显示前10个
    }
  } catch (error) {
    console.error('获取热门搜索失败:', error)
  }
}

// 处理搜索输入
const handleSearchInput = async () => {
  if (searchQuery.value.trim().length > 1) {
    try {
      const result = await neteaseMusicService.getSearchSuggest(searchQuery.value)
      if (result.success) {
        searchSuggestions.value = result.suggestions.slice(0, 5)
        showSuggestions.value = true
      }
    } catch (error) {
      console.error('获取搜索建议失败:', error)
    }
  } else {
    searchSuggestions.value = []
    showSuggestions.value = false
  }
}

// 执行搜索
const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  searching.value = true
  showSuggestions.value = false
  
  try {
    const result = await neteaseMusicService.searchSongs(searchQuery.value, 50, 0)
    if (result.success) {
      searchResults.value = result.songs
    } else {
      searchResults.value = []
      console.error('搜索失败:', result.error)
    }
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchSuggestions.value = []
  showSuggestions.value = false
}

// 选择搜索建议
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.name
  showSuggestions.value = false
  performSearch()
}

// 切换歌曲选择
const toggleSongSelection = (songId) => {
  if (selectedSongs.value.has(songId)) {
    selectedSongs.value.delete(songId)
  } else {
    selectedSongs.value.add(songId)
  }
}

// 全选/取消全选歌曲
const selectAllSongs = () => {
  if (selectedSongs.value.size === searchResults.value.length) {
    selectedSongs.value.clear()
  } else {
    selectedSongs.value.clear()
    searchResults.value.forEach(song => {
      selectedSongs.value.add(song.id)
    })
  }
}

// 下载单首歌曲
const downloadSong = async (song) => {
  downloading.value = true
  currentDownloadSong.value = song.name

  try {
    console.log('开始下载歌曲:', song.name, 'ID:', song.id)

    // 1. 获取歌曲详细信息（包含更高质量的封面）
    const songDetail = await neteaseMusicService.getSongDetail(song.id)
    console.log('歌曲详情:', songDetail)

    // 2. 如果有专辑ID，尝试获取专辑信息（可能有更好的封面）
    let albumInfo = null
    if (songDetail.success && songDetail.song.albumId) {
      albumInfo = await neteaseMusicService.getAlbumInfo(songDetail.song.albumId)
      console.log('专辑信息:', albumInfo)
    }

    // 3. 获取播放链接，尝试多种音质
    const qualityLevels = ['exhigh', 'standard', 'lossless'] // 优先极高音质，然后标准，最后无损
    let urlResult = null

    for (const quality of qualityLevels) {
      urlResult = await neteaseMusicService.getSongUrl(song.id, quality)
      if (urlResult.success && urlResult.url) {
        console.log(`成功获取${quality}音质播放链接:`, urlResult.url)
        break
      }
    }

    if (!urlResult || !urlResult.success) {
      throw new Error('无法获取播放链接，可能是VIP歌曲或地区限制')
    }

    // 4. 获取歌词
    const lyricsResult = await neteaseMusicService.getLyrics(song.id)
    console.log('歌词获取结果:', lyricsResult.success, '歌词长度:', lyricsResult.lyric?.length)

    // 检查歌词是否有效
    const hasValidLyrics = lyricsResult.success &&
                          lyricsResult.lyric &&
                          lyricsResult.lyric.trim().length > 0 &&
                          !lyricsResult.lyric.includes('纯音乐，请欣赏')

    // 5. 下载音频文件
    console.log('开始下载音频文件...')
    const audioBlob = await downloadAudioFile(urlResult.url)

    // 生成文件名
    const songId = generateId()
    const audioFileName = `netease_${songId}.mp3`
    let coverFileName = null
    let lrcFileName = null

    // 保存音频文件到IndexedDB
    await resourceManager.saveFile(audioBlob, 'songs', audioFileName)

    // 5. 下载并保存封面图片
    // 优先使用搜索结果中的封面URL，因为它通常更准确
    const coverUrl = song.cover
    console.log('歌曲封面URL:', coverUrl)
    console.log('歌曲信息:', { id: song.id, name: song.name, cover: song.cover })
    if (coverUrl) {
      try {
        console.log('开始下载封面:', coverUrl)
        let coverBlob = null

        // 直接下载加密后的正确封面URL
        try {
          console.log('下载加密封面URL:', coverUrl)
          coverBlob = await downloadImageFile(coverUrl)
          console.log('封面下载结果 - 大小:', coverBlob?.size, '类型:', coverBlob?.type)
        } catch (err) {
          console.warn('封面下载失败:', err.message)
          console.log('将使用默认封面图标')
        }

        if (coverBlob && coverBlob.size > 500) {
          const coverId = generateId()
          coverFileName = `netease_${coverId}.jpg`
          await resourceManager.saveFile(coverBlob, 'covers', coverFileName)
          console.log('封面保存成功:', coverFileName, '大小:', coverBlob.size)
        } else {
          console.warn('所有封面URL都下载失败，将使用在线封面URL')
          // 不设置coverFileName，这样会使用在线URL作为备用
        }
      } catch (error) {
        console.warn('下载封面失败:', error)
        console.log('将使用在线封面URL作为备用:', coverUrl)
      }
    }

    // 6. 保存歌词文件
    if (hasValidLyrics) {
      try {
        console.log('开始保存歌词，长度:', lyricsResult.lyric.length)
        const lyricsContent = lyricsResult.lyric.trim()
        const lyricsBlob = new Blob([lyricsContent], { type: 'text/plain;charset=utf-8' })
        const lyricsId = generateId()
        const tempLrcFileName = `netease_${lyricsId}.lrc`
        await resourceManager.saveFile(lyricsBlob, 'lyrics', tempLrcFileName)
        // 只有保存成功后才设置lrcFileName
        lrcFileName = tempLrcFileName
        console.log('歌词保存成功:', lrcFileName)
      } catch (error) {
        console.warn('保存歌词失败:', error)
        lrcFileName = null // 确保保存失败时lrcFileName为null
      }
    } else {
      if (!lyricsResult.success) {
        console.log('歌词获取失败:', lyricsResult.error)
      } else if (!lyricsResult.lyric || lyricsResult.lyric.trim().length === 0) {
        console.log('该歌曲没有歌词')
      } else if (lyricsResult.lyric.includes('纯音乐，请欣赏')) {
        console.log('该歌曲为纯音乐，无歌词')
      } else {
        console.log('歌词内容无效，跳过保存')
      }
    }

    // 创建音乐对象
    const musicData = {
      id: songId,
      title: song.name,
      artist: song.artist,
      album: song.album,
      duration: Math.floor(song.duration / 1000),
      audioFile: audioFileName,
      coverFile: coverFileName,
      coverUrl: null, // 不保存无效的在线URL，直接使用默认封面
      lrcFile: lrcFileName,
      source: 'netease',
      sourceId: song.id,
      createdAt: new Date().toISOString()
    }

    // 验证下载的音频文件
    try {
      const audioUrl = await resourceManager.getFile('songs', audioFileName)
      if (audioUrl) {
        console.log('音频文件已保存，URL:', audioUrl)

        // 创建一个临时的audio元素来测试文件是否可播放
        const testAudio = new Audio(audioUrl)
        testAudio.addEventListener('loadedmetadata', () => {
          console.log('音频文件验证成功，时长:', testAudio.duration)
        })
        testAudio.addEventListener('error', (e) => {
          console.error('音频文件验证失败:', e)
        })
        testAudio.load()
      }
    } catch (error) {
      console.warn('验证音频文件失败:', error)
    }

    // 触发音乐导入事件
    emit('songs-imported', [musicData])

    // 生成下载结果提示
    let downloadInfo = `下载成功: ${song.name}`
    if (coverFileName) {
      downloadInfo += '\n✅ 封面已下载'
    } else {
      downloadInfo += '\n⚠️ 封面下载失败，使用在线封面'
    }
    if (lrcFileName) {
      downloadInfo += '\n✅ 歌词已下载'
    } else {
      downloadInfo += '\n⚠️ 该歌曲无歌词或歌词获取失败'
    }

    alert(downloadInfo)

  } catch (error) {
    console.error('下载歌曲失败:', error)
    let errorMessage = error.message

    // 提供更友好的错误信息
    if (error.message.includes('无法获取播放链接')) {
      errorMessage = '无法获取播放链接，可能是VIP歌曲或地区限制'
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = '网络连接失败，请检查网络或API服务状态'
    } else if (error.message.includes('文件太小')) {
      errorMessage = '下载的音频文件无效，可能是版权限制'
    }

    alert(`下载失败: ${errorMessage}`)
  } finally {
    downloading.value = false
    currentDownloadSong.value = ''
  }
}

// 批量下载选中歌曲
const downloadSelected = async () => {
  if (selectedSongs.value.size === 0) return

  downloading.value = true
  downloadedCount.value = 0

  const selectedSongList = searchResults.value.filter(song =>
    selectedSongs.value.has(song.id)
  )

  const downloadedSongs = []
  let successCount = 0
  let coverCount = 0
  let lyricsCount = 0

  for (const song of selectedSongList) {
    try {
      currentDownloadSong.value = song.name

      // 获取播放链接，尝试不同的音质
      const qualityLevels = ['exhigh', 'standard', 'lossless']
      let urlResult = null

      for (const quality of qualityLevels) {
        urlResult = await neteaseMusicService.getSongUrl(song.id, quality)
        if (urlResult.success && urlResult.url) {
          break
        }
      }

      if (!urlResult || !urlResult.success) {
        console.warn(`跳过歌曲 ${song.name}: 无法获取播放链接`)
        continue
      }

      // 获取歌词
      const lyricsResult = await neteaseMusicService.getLyrics(song.id)

      // 检查歌词是否有效
      const hasValidLyrics = lyricsResult.success &&
                            lyricsResult.lyric &&
                            lyricsResult.lyric.trim().length > 0 &&
                            !lyricsResult.lyric.includes('纯音乐，请欣赏')

      // 下载音频文件
      const audioBlob = await downloadAudioFile(urlResult.url)

      // 生成文件名
      const songId = generateId()
      const audioFileName = `netease_${songId}.mp3`
      let coverFileName = null
      let lrcFileName = null

      // 保存音频文件到IndexedDB
      await resourceManager.saveFile(audioBlob, 'songs', audioFileName)

      // 下载并保存封面图片（使用加密后的正确URL）
      if (song.cover) {
        try {
          let coverBlob = null

          console.log(`歌曲 ${song.name} 下载加密封面URL:`, song.cover)

          try {
            const coverResponse = await fetch(song.cover, {
              mode: 'cors',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://music.163.com/'
              }
            })
            if (coverResponse.ok) {
              coverBlob = await coverResponse.blob()
              console.log(`歌曲 ${song.name} 封面下载成功，大小:`, coverBlob.size)
            }
          } catch (err) {
            console.warn(`歌曲 ${song.name} 封面下载失败:`, err.message)
          }

          if (coverBlob && coverBlob.size > 500) {
            const coverId = generateId()
            coverFileName = `netease_${coverId}.jpg`
            await resourceManager.saveFile(coverBlob, 'covers', coverFileName)
            console.log(`歌曲 ${song.name} 封面保存成功，大小:`, coverBlob.size)
          } else {
            console.warn(`歌曲 ${song.name} 所有封面URL都下载失败，将使用在线封面URL`)
            // 不设置coverFileName，这样会使用在线URL作为备用
          }
        } catch (error) {
          console.warn(`歌曲 ${song.name} 下载封面失败:`, error)
        }
      }

      // 保存歌词文件
      if (hasValidLyrics) {
        try {
          const lyricsContent = lyricsResult.lyric.trim()
          const lyricsBlob = new Blob([lyricsContent], { type: 'text/plain;charset=utf-8' })
          const lyricsId = generateId()
          const tempLrcFileName = `netease_${lyricsId}.lrc`
          await resourceManager.saveFile(lyricsBlob, 'lyrics', tempLrcFileName)
          // 只有保存成功后才设置lrcFileName
          lrcFileName = tempLrcFileName
          console.log(`歌曲 ${song.name} 歌词保存成功`)
        } catch (error) {
          console.warn(`歌曲 ${song.name} 保存歌词失败:`, error)
          lrcFileName = null // 确保保存失败时lrcFileName为null
        }
      } else {
        console.log(`歌曲 ${song.name} 没有有效歌词，跳过歌词保存`)
      }

      // 创建音乐对象
      const musicData = {
        id: songId,
        title: song.name,
        artist: song.artist,
        album: song.album,
        duration: Math.floor(song.duration / 1000),
        audioFile: audioFileName,
        coverFile: coverFileName,
        coverUrl: coverFileName ? null : song.cover, // 如果没有本地封面，保存在线URL
        lrcFile: lrcFileName,
        source: 'netease',
        sourceId: song.id,
        createdAt: new Date().toISOString()
      }
      downloadedSongs.push(musicData)
      successCount++
      if (coverFileName) coverCount++
      if (lrcFileName) lyricsCount++

      downloadedCount.value++

    } catch (error) {
      console.warn(`下载歌曲 ${song.name} 失败:`, error)
    }
  }

  // 触发音乐导入事件
  if (downloadedSongs.length > 0) {
    emit('songs-imported', downloadedSongs)

    // 生成详细的下载统计信息
    let downloadSummary = `批量下载完成！\n`
    downloadSummary += `✅ 成功下载 ${successCount} 首歌曲\n`
    downloadSummary += `🖼️ 封面下载 ${coverCount} 个\n`
    downloadSummary += `📝 歌词下载 ${lyricsCount} 个`

    if (selectedSongList.length > successCount) {
      downloadSummary += `\n⚠️ ${selectedSongList.length - successCount} 首歌曲下载失败`
    }

    alert(downloadSummary)
  } else {
    alert('批量下载失败，没有成功下载任何歌曲')
  }

  downloading.value = false
  selectedSongs.value.clear()
  currentDownloadSong.value = ''
  downloadedCount.value = 0
}

// 下载音频文件
const downloadAudioFile = async (url) => {
  console.log('开始下载音频文件:', url)

  const response = await fetch(url, {
    mode: 'cors',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://music.163.com/'
    }
  })

  console.log('音频下载响应状态:', response.status, response.headers.get('content-type'))

  if (!response.ok) {
    throw new Error(`音频下载失败: ${response.status} ${response.statusText}`)
  }

  const blob = await response.blob()
  console.log('下载的音频文件大小:', blob.size, '类型:', blob.type)

  // 检查文件大小，如果太小可能是错误响应
  if (blob.size < 10000) { // 音频文件至少应该有10KB
    throw new Error('下载的音频文件太小，可能是无效文件')
  }

  // 根据响应的content-type设置正确的MIME类型
  const contentType = response.headers.get('content-type') || 'audio/mpeg'
  return new Blob([blob], { type: contentType })
}

// 下载图片文件
const downloadImageFile = async (url) => {
  console.log('开始下载图片文件:', url)

  const response = await fetch(url, {
    mode: 'cors',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://music.163.com/'
    }
  })

  console.log('图片下载响应:', {
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get('content-type'),
    contentLength: response.headers.get('content-length'),
    url: response.url
  })

  if (!response.ok) {
    throw new Error(`图片下载失败: ${response.status} ${response.statusText}`)
  }

  const blob = await response.blob()
  console.log('下载的图片文件:', {
    size: blob.size,
    type: blob.type,
    sizeKB: Math.round(blob.size / 1024) + 'KB'
  })

  // 检查文件大小和类型 - 降低最小文件大小要求
  if (blob.size < 500) {
    throw new Error(`下载的图片文件太小: ${blob.size} bytes`)
  }

  // 确保是图片类型
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) {
    throw new Error('下载的不是图片文件')
  }

  return new Blob([blob], { type: contentType })
}

// 格式化时长
const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 组件初始化
onMounted(async () => {
  await checkApiStatus()
  if (apiOnline.value) {
    await getHotSearch()
  }
})
</script>

<style scoped>
.netease-online-container {
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.online-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color);
}

.header-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.info-icon {
  font-size: 2rem;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.info-content h3 {
  margin: 0 0 var(--space-xs) 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.info-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.api-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
}

.api-status.online {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.api-status.offline {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.vip-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(156, 163, 175, 0.1);
  color: var(--text-secondary);
}

.vip-status.vip {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.vip-status.black {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.vip-status.super {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(168, 85, 247, 0.1));
  color: #f59e0b;
}

.vip-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: var(--space-xs);
}

.vip-badge.free {
  background: rgba(156, 163, 175, 0.2);
  color: var(--text-secondary);
}

.vip-badge.normal {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.vip-badge.black {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.vip-badge.super {
  background: linear-gradient(135deg, #fbbf24, #a855f7);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-btn {
  margin-left: var(--space-xs);
  padding: 2px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.logout-btn {
  margin-left: var(--space-xs);
  padding: 2px 6px;
  border: 1px solid #ef4444;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}

/* 验证码处理样式 */
.captcha-section {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 8px;
}

.captcha-notice {
  text-align: center;
  margin-bottom: var(--space-md);
}

.captcha-warning {
  color: #ff6b35;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.captcha-tip {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.captcha-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}

.captcha-btn, .retry-btn {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid #ffc107;
  border-radius: 6px;
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.captcha-btn:hover {
  background: #ffc107;
  color: #000;
}

.retry-btn {
  border-color: #28a745;
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.retry-btn:hover {
  background: #28a745;
  color: white;
}

/* 登录模态框样式 */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.login-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.login-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.login-content {
  padding: var(--space-lg);
}

.login-step {
  text-align: center;
}

.generate-qr-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: var(--space-md);
}

.generate-qr-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.generate-qr-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qr-login-step {
  text-align: center;
}

.qr-container {
  margin: var(--space-lg) 0;
  display: flex;
  justify-content: center;
}

.qr-display {
  position: relative;
}

.qr-image {
  width: 200px;
  height: 200px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.qr-fallback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.qr-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  font-size: 0.9rem;
}

.qr-link {
  text-align: center;
}

.qr-link p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.qr-url-input {
  width: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.8rem;
  margin-bottom: var(--space-sm);
  cursor: pointer;
}

.copy-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--primary-hover);
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.option-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  background: var(--bg-secondary);
}

.option-card h4 {
  margin: 0 0 var(--space-xs) 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.option-card p {
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.browser-login-btn {
  padding: var(--space-sm) var(--space-lg);
  background: #1db954;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.browser-login-btn:hover {
  background: #1ed760;
}

.manual-cookie-section {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.manual-cookie-section h4 {
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.manual-cookie-section p {
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.cookie-steps {
  margin: var(--space-sm) 0;
  padding-left: var(--space-lg);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.cookie-steps li {
  margin-bottom: var(--space-xs);
}

.cookie-steps a {
  color: var(--primary-color);
  text-decoration: none;
}

.cookie-steps a:hover {
  text-decoration: underline;
}

.cookie-input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.cookie-input {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: monospace;
  resize: vertical;
}

.cookie-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.update-cookie-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.update-cookie-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.update-cookie-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.login-instructions p {
  margin: var(--space-sm) 0;
  color: var(--text-secondary);
}

.login-status {
  font-weight: 500;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  margin: var(--space-md) 0;
}

.login-status.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.login-status.warning {
  background: rgba(251, 191, 36, 0.1);
  color: #f59e0b;
}

.login-status.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.login-status.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.login-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  margin-top: var(--space-lg);
}

.refresh-qr-btn, .cancel-btn {
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-qr-btn:hover, .cancel-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.search-section {
  margin-bottom: var(--space-lg);
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.search-input {
  flex: 1;
  padding: var(--space-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn, .clear-btn {
  padding: var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn {
  background: var(--primary-color);
  color: white;
  min-width: 48px;
}

.search-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 60px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background: var(--bg-hover);
}

.suggestion-type {
  font-size: 0.9rem;
}

.suggestion-text {
  font-weight: 500;
  color: var(--text-primary);
}

.suggestion-artist {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.hot-search h4 {
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.hot-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.hot-keyword {
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hot-keyword:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

.search-results {
  margin-bottom: var(--space-lg);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
}

.results-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.results-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-btn {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.action-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.song-item.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: var(--primary-color);
}

.song-checkbox {
  display: flex;
  align-items: center;
}

.song-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-details {
  display: flex;
  gap: var(--space-md);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.song-details span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  max-width: 150px;
}

.song-album {
  max-width: 120px;
}

.song-actions {
  display: flex;
  gap: var(--space-xs);
}

.download-btn {
  padding: var(--space-xs) var(--space-sm);
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.download-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-1px);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-progress {
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: var(--radius-md);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  font-size: 0.9rem;
  color: #4CAF50;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.usage-info {
  margin-top: var(--space-lg);
}

.info-card {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.info-card .info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-card .info-content h4 {
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.info-card .info-content ul {
  margin: 0;
  padding-left: var(--space-lg);
  color: var(--text-secondary);
}

.info-card .info-content li {
  margin-bottom: var(--space-xs);
  font-size: 0.9rem;
}
</style>
