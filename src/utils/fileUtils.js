// 文件处理工具类

/**
 * 支持的音频文件格式
 */
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',     // MP3
  'audio/mp4',      // MP4/M4A
  'audio/wav',      // WAV
  'audio/flac',     // FLAC
  'audio/ogg',      // OGG
  'audio/webm',     // WEBM
  'audio/aac'       // AAC
]

/**
 * 支持的图片文件格式
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',     // JPG/JPEG
  'image/png',      // PNG
  'image/webp',     // WEBP
  'image/gif'       // GIF
]

/**
 * 检查文件是否为支持的音频格式
 */
export function isAudioFile(file) {
  return SUPPORTED_AUDIO_FORMATS.includes(file.type)
}

/**
 * 检查文件是否为支持的图片格式
 */
export function isImageFile(file) {
  return SUPPORTED_IMAGE_FORMATS.includes(file.type)
}

/**
 * 检查文件是否为支持的歌词格式
 */
export function isLyricsFile(file) {
  const fileName = file.name.toLowerCase()
  return fileName.endsWith('.lrc') || fileName.endsWith('.txt')
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时间（秒转为 mm:ss 格式）
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

/**
 * 生成唯一ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 从文件名提取歌曲信息
 */
export function extractSongInfoFromFilename(filename) {
  // 移除文件扩展名
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // 尝试解析 "艺术家 - 歌曲名" 格式
  const parts = nameWithoutExt.split(' - ')
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    }
  }
  
  // 如果没有找到分隔符，使用文件名作为标题
  return {
    artist: '未知艺术家',
    title: nameWithoutExt.trim()
  }
}

/**
 * 提取音频文件的元数据
 */
export function extractAudioMetadata(file) {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration
      URL.revokeObjectURL(url)
      
      // 从文件名提取基本信息
      const { artist, title } = extractSongInfoFromFilename(file.name)
      
      resolve({
        title,
        artist,
        duration: formatDuration(duration),
        durationSeconds: duration,
        fileSize: formatFileSize(file.size),
        format: file.type
      })
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      const { artist, title } = extractSongInfoFromFilename(file.name)
      
      resolve({
        title,
        artist,
        duration: '0:00',
        durationSeconds: 0,
        fileSize: formatFileSize(file.size),
        format: file.type
      })
    })
    
    audio.src = url
  })
}

/**
 * 将文件转换为Base64 URL（用于本地预览）
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 创建文件的对象URL（用于音频播放）
 */
export function createFileURL(file) {
  return URL.createObjectURL(file)
}

/**
 * 验证上传的文件
 */
export function validateUploadedFiles(files) {
  const audioFiles = []
  const imageFiles = []
  const lyricsFiles = []
  const invalidFiles = []

  Array.from(files).forEach(file => {
    if (isAudioFile(file)) {
      audioFiles.push(file)
    } else if (isImageFile(file)) {
      imageFiles.push(file)
    } else if (isLyricsFile(file)) {
      lyricsFiles.push(file)
    } else {
      invalidFiles.push(file)
    }
  })

  return {
    audioFiles,
    imageFiles,
    lyricsFiles,
    invalidFiles
  }
}

/**
 * 将文件保存到IndexedDB（模拟静态资源存储）
 */
export class StaticResourceManager {
  constructor() {
    this.dbName = 'MusicPlayerAssets'
    this.version = 4 // 增加版本号以添加音乐库和播放列表存储
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建音频文件存储
        if (!db.objectStoreNames.contains('songs')) {
          const songStore = db.createObjectStore('songs', { keyPath: 'id' })
          songStore.createIndex('filename', 'filename', { unique: true })
        }

        // 创建封面图片存储
        if (!db.objectStoreNames.contains('covers')) {
          const coverStore = db.createObjectStore('covers', { keyPath: 'id' })
          coverStore.createIndex('filename', 'filename', { unique: true })
        }

        // 创建歌词文件存储
        if (!db.objectStoreNames.contains('lyrics')) {
          const lyricsStore = db.createObjectStore('lyrics', { keyPath: 'id' })
          lyricsStore.createIndex('filename', 'filename', { unique: true })
        }

        // 创建用户设置存储
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'key' })
        }

        // 创建音乐库数据存储
        if (!db.objectStoreNames.contains('musicLibrary')) {
          const musicLibraryStore = db.createObjectStore('musicLibrary', { keyPath: 'id' })
          musicLibraryStore.createIndex('title', 'title', { unique: false })
          musicLibraryStore.createIndex('artist', 'artist', { unique: false })
        }

        // 创建播放列表存储
        if (!db.objectStoreNames.contains('playlists')) {
          const playlistsStore = db.createObjectStore('playlists', { keyPath: 'id' })
          playlistsStore.createIndex('name', 'name', { unique: false })
        }
      }
    })
  }

  async saveFile(file, type, filename) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          // 检查object store是否存在
          if (!this.db.objectStoreNames.contains(type)) {
            reject(new Error(`Object store '${type}' not found. Available stores: ${Array.from(this.db.objectStoreNames).join(', ')}`))
            return
          }

          const transaction = this.db.transaction([type], 'readwrite')
          const store = transaction.objectStore(type)

        const fileData = {
          id: generateId(),
          filename: filename,
          data: reader.result,
          originalName: file.name,
          type: file.type,
          size: file.size,
          createdAt: new Date().toISOString()
        }

          const request = store.add(fileData)
          request.onsuccess = () => resolve(fileData)
          request.onerror = () => reject(request.error)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  async getFile(type, filename) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([type], 'readonly')
      const store = transaction.objectStore(type)
      const index = store.index('filename')

      const request = index.get(filename)
      request.onsuccess = () => {
        if (request.result) {
          const blob = new Blob([request.result.data], { type: request.result.type })
          const url = URL.createObjectURL(blob)
          resolve(url)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getFileBlob(type, filename) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([type], 'readonly')
      const store = transaction.objectStore(type)
      const index = store.index('filename')

      const request = index.get(filename)
      request.onsuccess = () => {
        if (request.result) {
          const blob = new Blob([request.result.data], { type: request.result.type })
          resolve(blob)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getAllFiles(type) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([type], 'readonly')
      const store = transaction.objectStore(type)

      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteFile(type, filename) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([type], 'readwrite')
      const store = transaction.objectStore(type)
      const index = store.index('filename')

      const getRequest = index.get(filename)
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const deleteRequest = store.delete(getRequest.result.id)
          deleteRequest.onsuccess = () => resolve(true)
          deleteRequest.onerror = () => reject(deleteRequest.error)
        } else {
          resolve(false)
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async exportAssets() {
    const songs = await this.getAllFiles('songs')
    const covers = await this.getAllFiles('covers')

    return {
      songs: songs.map(song => ({
        filename: song.filename,
        originalName: song.originalName,
        type: song.type,
        size: song.size,
        createdAt: song.createdAt
      })),
      covers: covers.map(cover => ({
        filename: cover.filename,
        originalName: cover.originalName,
        type: cover.type,
        size: cover.size,
        createdAt: cover.createdAt
      }))
    }
  }

  async downloadFile(type, filename) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([type], 'readonly')
      const store = transaction.objectStore(type)
      const index = store.index('filename')

      const request = index.get(filename)
      request.onsuccess = () => {
        if (request.result) {
          const blob = new Blob([request.result.data], { type: request.result.type })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = request.result.originalName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          resolve(true)
        } else {
          resolve(false)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // ===== 用户设置管理方法 =====

  /**
   * 保存用户设置
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  async saveSetting(key, value) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')

      const settingData = {
        key: key,
        value: value,
        updatedAt: new Date().toISOString()
      }

      const request = store.put(settingData)
      request.onsuccess = () => resolve(settingData)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取用户设置
   * @param {string} key - 设置键名
   * @param {any} defaultValue - 默认值
   */
  async getSetting(key, defaultValue = null) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')

      const request = store.get(key)
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value)
        } else {
          resolve(defaultValue)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 删除用户设置
   * @param {string} key - 设置键名
   */
  async deleteSetting(key) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')

      const request = store.delete(key)
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取所有用户设置
   */
  async getAllSettings() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')

      const request = store.getAll()
      request.onsuccess = () => {
        const settings = {}
        request.result.forEach(item => {
          settings[item.key] = item.value
        })
        resolve(settings)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 保存主题设置
   * @param {boolean} isDarkMode - 是否为暗色主题
   */
  async saveTheme(isDarkMode) {
    return await this.saveSetting('theme', isDarkMode ? 'dark' : 'light')
  }

  /**
   * 获取主题设置
   * @returns {string} 'light' | 'dark'
   */
  async getTheme() {
    return await this.getSetting('theme', 'light')
  }

  // ===== 音乐库数据管理方法 =====

  /**
   * 保存音乐库数据
   * @param {Array} musicLibrary - 音乐库数组
   */
  async saveMusicLibrary(musicLibrary) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['musicLibrary'], 'readwrite')
      const store = transaction.objectStore('musicLibrary')

      // 清空现有数据
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => {
        // 添加新数据
        let completed = 0
        const total = musicLibrary.length

        if (total === 0) {
          resolve([])
          return
        }

        musicLibrary.forEach(song => {
          const addRequest = store.add({
            ...song,
            updatedAt: new Date().toISOString()
          })

          addRequest.onsuccess = () => {
            completed++
            if (completed === total) {
              resolve(musicLibrary)
            }
          }

          addRequest.onerror = () => reject(addRequest.error)
        })
      }

      clearRequest.onerror = () => reject(clearRequest.error)
    })
  }

  /**
   * 获取音乐库数据
   * @returns {Array} 音乐库数组
   */
  async getMusicLibrary() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['musicLibrary'], 'readonly')
      const store = transaction.objectStore('musicLibrary')

      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 保存播放列表数据
   * @param {Array} playlists - 播放列表数组
   */
  async savePlaylists(playlists) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['playlists'], 'readwrite')
      const store = transaction.objectStore('playlists')

      // 清空现有数据
      const clearRequest = store.clear()
      clearRequest.onsuccess = () => {
        // 添加新数据
        let completed = 0
        const total = playlists.length

        if (total === 0) {
          resolve([])
          return
        }

        playlists.forEach(playlist => {
          const addRequest = store.add({
            ...playlist,
            updatedAt: new Date().toISOString()
          })

          addRequest.onsuccess = () => {
            completed++
            if (completed === total) {
              resolve(playlists)
            }
          }

          addRequest.onerror = () => reject(addRequest.error)
        })
      }

      clearRequest.onerror = () => reject(clearRequest.error)
    })
  }

  /**
   * 获取播放列表数据
   * @returns {Array} 播放列表数组
   */
  async getPlaylists() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['playlists'], 'readonly')
      const store = transaction.objectStore('playlists')

      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 从localStorage迁移数据到IndexedDB
   */
  async migrateFromLocalStorage() {
    try {
      // 迁移音乐库数据
      const musicLibraryData = localStorage.getItem('musicplayer_playlist')
      if (musicLibraryData) {
        const musicLibrary = JSON.parse(musicLibraryData)
        await this.saveMusicLibrary(musicLibrary)
        localStorage.removeItem('musicplayer_playlist')
        console.log('音乐库数据已迁移到IndexedDB')
      }

      // 迁移播放列表数据
      const playlistsData = localStorage.getItem('musicplayer_playlists')
      if (playlistsData) {
        const playlists = JSON.parse(playlistsData)
        await this.savePlaylists(playlists)
        localStorage.removeItem('musicplayer_playlists')
        console.log('播放列表数据已迁移到IndexedDB')
      }
    } catch (error) {
      console.error('数据迁移失败:', error)
    }
  }
}

// 创建全局实例
export const resourceManager = new StaticResourceManager()
