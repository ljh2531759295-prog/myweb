/**
 * 网易云音乐API服务
 * 使用自定义Node.js版本的网易云音乐API
 * 基于 https://github.com/Suxiaoqinx/Netease_url 项目的Node.js实现
 */

class NeteaseMusicService {
  constructor(baseUrl = null) {
    // 在开发环境使用代理，生产环境使用本地API服务
    this.baseUrl = baseUrl || (import.meta.env.DEV ? '/api/netease' : 'http://localhost:3000')
    this.requestQueue = []
    this.isProcessing = false
    this.requestDelay = 300 // 300ms延迟避免频率限制
  }

  // 带限流的请求方法
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject })
      this.processQueue()
    })
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return

    this.isProcessing = true

    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject } = this.requestQueue.shift()

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        resolve(data)
      } catch (error) {
        console.error('API请求失败:', error)
        reject(error)
      }

      // 添加延迟避免频率限制
      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.requestDelay))
      }
    }

    this.isProcessing = false
  }

  // 搜索歌曲
  async searchSongs(keyword, limit = 20, offset = 0) {
    try {
      const url = `${this.baseUrl}/Search?keywords=${encodeURIComponent(keyword)}&limit=${limit}`
      const data = await this.makeRequest(url)

      console.log('搜索API响应:', data) // 调试信息

      if (data.status === 200 && data.result) {
        return {
          success: true,
          songs: data.result.map(song => ({
            id: song.id,
            name: song.name || '未知歌曲',
            artist: (song.artists && Array.isArray(song.artists)) ? song.artists.map(a => a.name).join(', ') : '未知艺术家',
            artists: song.artists || [],
            album: (song.album && song.album.name) ? song.album.name : '未知专辑',
            albumId: (song.album && song.album.id) ? song.album.id : null,
            duration: song.duration || 0,
            cover: (song.album && song.album.picUrl) ? song.album.picUrl : '',
            source: 'netease'
          })),
          total: data.result.length || 0
        }
      }

      return { success: false, songs: [], total: 0, error: '搜索结果为空' }
    } catch (error) {
      console.error('搜索歌曲失败:', error)
      return { success: false, songs: [], total: 0, error: error.message }
    }
  }

  // 获取歌曲播放链接
  async getSongUrl(id, level = 'exhigh') {
    try {
      const url = `${this.baseUrl}/Song_V1?ids=${id}&level=${level}&type=json`
      const data = await this.makeRequest(url)

      console.log(`获取歌曲${id}播放链接响应:`, data)

      if (data.status === 200 && data.url) {
        return {
          success: true,
          url: data.url,
          br: data.level,
          size: data.size,
          type: 'mp3'
        }
      }

      return { success: false, error: '无法获取播放链接' }
    } catch (error) {
      console.error('获取播放链接失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 获取歌词
  async getLyrics(id) {
    try {
      const url = `${this.baseUrl}/lyric?id=${id}`
      const data = await this.makeRequest(url)

      if (data.status === 200) {
        return {
          success: true,
          lyric: data.lyric || '',
          tlyric: data.tlyric || '', // 翻译歌词
          romalrc: '' // 罗马音歌词
        }
      }

      return { success: false, lyric: '', error: '无法获取歌词' }
    } catch (error) {
      console.error('获取歌词失败:', error)
      return { success: false, lyric: '', error: error.message }
    }
  }

  // 获取歌曲详情
  async getSongDetail(ids) {
    try {
      const idsStr = Array.isArray(ids) ? ids.join(',') : ids
      const url = `${this.baseUrl}/song/detail?ids=${idsStr}`
      const data = await this.makeRequest(url)
      
      if (data.code === 200 && data.songs) {
        return {
          success: true,
          songs: data.songs.map(song => ({
            id: song.id,
            name: song.name,
            artist: song.ar.map(a => a.name).join(', '),
            artists: song.ar,
            album: song.al.name,
            albumId: song.al.id,
            duration: song.dt,
            cover: song.al.picUrl,
            publishTime: song.publishTime,
            source: 'netease'
          }))
        }
      }
      
      return { success: false, songs: [], error: '获取歌曲详情失败' }
    } catch (error) {
      console.error('获取歌曲详情失败:', error)
      return { success: false, songs: [], error: error.message }
    }
  }

  // 获取热门搜索
  async getHotSearch() {
    try {
      const url = `${this.baseUrl}/search/hot`
      const data = await this.makeRequest(url)
      
      if (data.code === 200 && data.result?.hots) {
        return {
          success: true,
          keywords: data.result.hots.map(item => item.first)
        }
      }
      
      return { success: false, keywords: [], error: '获取热门搜索失败' }
    } catch (error) {
      console.error('获取热门搜索失败:', error)
      return { success: false, keywords: [], error: error.message }
    }
  }

  // 获取搜索建议
  async getSearchSuggest(keyword) {
    try {
      const url = `${this.baseUrl}/search/suggest?keywords=${encodeURIComponent(keyword)}&type=mobile`
      const data = await this.makeRequest(url)
      
      if (data.code === 200 && data.result) {
        const suggestions = []
        
        // 添加歌曲建议
        if (data.result.songs) {
          suggestions.push(...data.result.songs.map(song => ({
            type: 'song',
            name: song.name,
            artist: song.artists.map(a => a.name).join(', '),
            id: song.id
          })))
        }
        
        // 添加艺术家建议
        if (data.result.artists) {
          suggestions.push(...data.result.artists.map(artist => ({
            type: 'artist',
            name: artist.name,
            id: artist.id
          })))
        }
        
        return { success: true, suggestions }
      }
      
      return { success: false, suggestions: [], error: '获取搜索建议失败' }
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      return { success: false, suggestions: [], error: error.message }
    }
  }

  // 检查API服务状态
  async checkStatus() {
    try {
      const url = `${this.baseUrl}/`
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000 
      })
      return response.ok
    } catch (error) {
      console.error('API服务不可用:', error)
      return false
    }
  }

  // 设置API基础URL
  // 检查API状态
  async checkStatus() {
    try {
      // 尝试调用一个简单的API来检查状态
      const url = `${this.baseUrl}/`
      const data = await this.makeRequest(url)
      return data.message && data.message.includes('Node.js版网易云音乐API')
    } catch (error) {
      console.error('检查API状态失败:', error)
      return false
    }
  }

  // 获取热门搜索
  async getHotSearch() {
    try {
      // 返回一些默认的热门搜索关键词
      return {
        success: true,
        keywords: ['周杰伦', '邓紫棋', '薛之谦', '林俊杰', '陈奕迅', '张学友', '王菲', '李荣浩', '毛不易', '华晨宇']
      }
    } catch (error) {
      console.error('获取热门搜索失败:', error)
      return { success: false, keywords: [] }
    }
  }

  // 获取搜索建议
  async getSearchSuggest(keyword) {
    try {
      // 简化版本：基于关键词进行简单的搜索
      const searchResult = await this.searchSongs(keyword, 5)

      if (searchResult.success) {
        const suggestions = searchResult.songs.map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artist,
          type: 'song'
        }))

        return {
          success: true,
          suggestions: suggestions
        }
      }

      return { success: false, suggestions: [] }
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      return { success: false, suggestions: [] }
    }
  }

  // 获取歌曲详情
  async getSongDetail(ids) {
    try {
      const idsStr = Array.isArray(ids) ? ids.join(',') : ids.toString()
      const url = `${this.baseUrl}/song/detail?ids=${idsStr}`
      const data = await this.makeRequest(url)

      console.log('歌曲详情API响应:', data)

      if (data.code === 200 && data.songs && data.songs.length > 0) {
        const song = data.songs[0]
        return {
          success: true,
          song: {
            id: song.id,
            name: song.name,
            artists: song.ar || [],
            album: song.al || {},
            duration: song.dt,
            // 获取更高质量的封面 - 使用500x500分辨率
            cover: song.al?.picUrl ? song.al.picUrl.replace(/\?param=\d+y\d+/, '?param=500y500') : null,
            // 获取专辑信息
            albumId: song.al?.id,
            albumName: song.al?.name,
            // 发布时间
            publishTime: song.publishTime,
            // 流行度
            popularity: song.pop
          }
        }
      }

      return { success: false, error: '获取歌曲详情失败' }
    } catch (error) {
      console.error('获取歌曲详情失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 获取专辑信息（包含更高质量的封面）
  async getAlbumInfo(albumId) {
    try {
      const url = `${this.baseUrl}/album?id=${albumId}`
      const data = await this.makeRequest(url)

      if (data.code === 200 && data.album) {
        return {
          success: true,
          album: {
            id: data.album.id,
            name: data.album.name,
            // 获取专辑高质量封面
            cover: data.album.picUrl ? data.album.picUrl.replace(/\?param=\d+y\d+/, '?param=500y500') : null,
            artist: data.album.artist?.name || '',
            publishTime: data.album.publishTime,
            description: data.album.description
          }
        }
      }

      return { success: false, error: '获取专辑信息失败' }
    } catch (error) {
      console.error('获取专辑信息失败:', error)
      return { success: false, error: error.message }
    }
  }

  setBaseUrl(url) {
    this.baseUrl = url
  }


}

// 创建单例实例
export const neteaseMusicService = new NeteaseMusicService()

// 导出类供其他地方使用
export default NeteaseMusicService
