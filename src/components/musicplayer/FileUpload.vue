<template>
  <div class="upload-section">
    <div class="upload-header">
      <h2>添加音乐</h2>
      <p>拖拽音乐文件、封面图片和歌词文件到下方区域，或点击选择文件</p>
    </div>
    
    <!-- 文件拖拽区域 -->
    <div 
      class="drop-zone"
      :class="{ 
        'drag-over': isDragOver,
        'uploading': isUploading 
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <div class="drop-zone-content">
        <div class="upload-icon">📁</div>
        <div class="upload-text">
          <h3>拖拽文件到这里</h3>
          <p>支持 MP3、MP4、WAV、FLAC 等音频格式</p>
          <p>支持 JPG、PNG、WEBP 等图片格式</p>
          <p>支持 LRC、TXT 等歌词格式</p>
        </div>
        <div class="upload-buttons">
          <button class="upload-button" type="button">
            选择文件
          </button>
          <button class="batch-import-button" type="button" @click="triggerFolderSelect">
            📁 批量导入文件夹
          </button>
        </div>
      </div>
      
      <!-- 上传进度 -->
      <div v-if="isUploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
        <p>正在处理文件... {{ uploadProgress }}%</p>
      </div>

      <!-- 批量导入进度 -->
      <div v-if="isBatchScanning" class="batch-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${batchProgress}%` }"></div>
        </div>
        <p>{{ batchStatusText }}</p>
        <div class="batch-stats">
          <span>已扫描: {{ scannedCount }} 个文件</span>
          <span>找到音频: {{ foundAudioCount }} 个</span>
        </div>
      </div>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="audio/*,image/*,.lrc,.txt"
      style="display: none"
      @change="handleFileSelect"
    >

    <!-- 隐藏的封面上传输入 -->
    <input
      ref="coverInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleCoverSelect"
    >

    <!-- 隐藏的歌词上传输入 -->
    <input
      ref="lyricsInput"
      type="file"
      accept=".lrc,.LRC,.txt,.TXT"
      style="display: none"
      @change="handleLyricsSelect"
    >

    <!-- 隐藏的文件夹选择输入 -->
    <input
      ref="folderInput"
      type="file"
      webkitdirectory
      multiple
      style="display: none"
      @change="handleFolderSelect"
    >
    
    <!-- 文件预览列表 -->
    <div v-if="pendingFiles.length > 0" class="file-preview">
      <h3>待添加的文件</h3>
      <div class="file-list">
        <div
          v-for="(fileInfo, index) in pendingFiles"
          :key="index"
          class="file-item"
          :class="{ 'audio-file': fileInfo.type === 'audio' }"
        >
          <div class="file-info">
            <div class="file-icon">
              {{ fileInfo.type === 'audio' ? '🎵' : fileInfo.type === 'lyrics' ? '📝' : '🖼️' }}
            </div>
            <div class="file-details">
              <div v-if="fileInfo.type === 'audio'" class="audio-inputs">
                <div class="input-group">
                  <label>歌曲名称:</label>
                  <input
                    v-model="fileInfo.title"
                    type="text"
                    placeholder="请输入歌曲名称"
                    class="song-input"
                  />
                </div>
                <div class="input-group">
                  <label>歌手:</label>
                  <input
                    v-model="fileInfo.artist"
                    type="text"
                    placeholder="请输入歌手名称"
                    class="song-input"
                  />
                </div>
                <div class="input-group">
                  <label>封面:</label>
                  <select v-model="fileInfo.selectedCover" class="cover-select">
                    <option value="">选择封面图片</option>
                    <option
                      v-for="(cover, coverIndex) in availableCovers"
                      :key="coverIndex"
                      :value="cover.id"
                    >
                      {{ cover.name }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="upload-cover-btn"
                    @click="triggerCoverUpload(index)"
                  >
                    上传封面
                  </button>
                </div>
                <div class="input-group">
                  <label>歌词:</label>
                  <select v-model="fileInfo.selectedLyrics" class="lyrics-select">
                    <option value="">选择歌词文件（可选）</option>
                    <option
                      v-for="(lyrics, lyricsIndex) in availableLyrics"
                      :key="lyricsIndex"
                      :value="lyrics.id"
                    >
                      {{ lyrics.name }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="upload-lyrics-btn"
                    @click="triggerLyricsUpload(index)"
                  >
                    上传歌词
                  </button>
                </div>
                <p class="file-meta">
                  {{ fileInfo.duration || '' }} | {{ fileInfo.fileSize }}
                </p>
              </div>
              <div v-else-if="fileInfo.type === 'image'" class="image-info">
                <h4>{{ fileInfo.name }}</h4>
                <p class="file-meta">{{ formatFileSize(fileInfo.file.size) }}</p>
              </div>
              <div v-else-if="fileInfo.type === 'lyrics'" class="lyrics-info">
                <h4>{{ fileInfo.name }}</h4>
                <p class="file-meta">歌词文件 | {{ formatFileSize(fileInfo.file.size) }}</p>
                <p class="lyrics-preview" v-if="fileInfo.preview">{{ fileInfo.preview }}</p>
              </div>
            </div>
          </div>
          <button
            class="remove-button"
            @click="removePendingFile(index)"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div class="upload-actions">
        <button 
          class="confirm-button"
          @click="confirmUpload"
          :disabled="isUploading"
        >
          添加到播放列表
        </button>
        <button
          class="cancel-button"
          @click="clearPendingFiles"
          :disabled="isUploading"
        >
          清空
        </button>
        <button
          class="test-lyrics-button"
          @click="testLyricsUpload"
          :disabled="isUploading"
        >
          测试歌词上传
        </button>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="clearError">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  validateUploadedFiles,
  extractAudioMetadata,
  fileToDataURL,
  createFileURL,
  generateId,
  formatFileSize
} from '@/utils/fileUtils'

const emit = defineEmits(['files-uploaded'])

// 响应式数据
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const pendingFiles = ref([])
const fileInput = ref(null)
const coverInput = ref(null)
const lyricsInput = ref(null)
const folderInput = ref(null)
const currentUploadingIndex = ref(-1)

// 批量导入相关数据
const isBatchScanning = ref(false)
const batchProgress = ref(0)
const batchStatusText = ref('')
const scannedCount = ref(0)
const foundAudioCount = ref(0)

// 计算可用的封面图片
const availableCovers = computed(() => {
  return pendingFiles.value
    .filter(file => file.type === 'image')
    .map(file => ({
      id: file.id,
      name: file.name,
      url: file.url
    }))
})

// 计算可用的歌词文件
const availableLyrics = computed(() => {
  return pendingFiles.value
    .filter(file => file.type === 'lyrics')
    .map(file => ({
      id: file.id,
      name: file.name,
      content: file.content
    }))
})

// 拖拽事件处理
const handleDragOver = (e) => {
  e.preventDefault()
}

const handleDragEnter = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  const files = e.dataTransfer.files
  processFiles(files)
}

// 文件选择处理
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  processFiles(files)
  // 清空input值，允许重复选择同一文件
  e.target.value = ''
}

// 触发封面上传
const triggerCoverUpload = (audioIndex) => {
  currentUploadingIndex.value = audioIndex
  coverInput.value.click()
}

// 处理封面选择
const handleCoverSelect = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const imageURL = await fileToDataURL(file)
    const coverId = generateId()

    // 添加到待处理文件列表
    const coverInfo = {
      id: coverId,
      type: 'image',
      file: file,
      name: file.name,
      url: imageURL,
      fileSize: formatFileSize(file.size)
    }

    pendingFiles.value.push(coverInfo)

    // 如果是为特定音频文件上传封面，自动选择
    if (currentUploadingIndex.value >= 0) {
      const audioFile = pendingFiles.value.find((f, index) =>
        f.type === 'audio' && index === currentUploadingIndex.value
      )
      if (audioFile) {
        audioFile.selectedCover = coverId
      }
    }

  } catch (error) {
    errorMessage.value = '封面上传失败，请重试'
    console.error('封面上传错误:', error)
  } finally {
    currentUploadingIndex.value = -1
    e.target.value = ''
  }
}

// 触发歌词上传
const triggerLyricsUpload = (audioIndex) => {
  console.log('触发歌词上传，音频索引:', audioIndex)
  console.log('lyricsInput.value:', lyricsInput.value)
  console.log('pendingFiles.value:', pendingFiles.value)

  currentUploadingIndex.value = audioIndex

  // 确保在下一个tick中执行，让DOM完全渲染
  setTimeout(() => {
    if (lyricsInput.value) {
      console.log('找到lyricsInput，触发点击')
      lyricsInput.value.click()
    } else {
      console.error('lyricsInput ref 未找到')
      // 尝试直接查找元素
      const lyricsInputElement = document.querySelector('input[accept*=".lrc"]')
      if (lyricsInputElement) {
        console.log('通过querySelector找到歌词输入元素')
        lyricsInputElement.click()
      } else {
        console.error('无法找到歌词输入元素')
      }
    }
  }, 100)
}

// 处理歌词选择
const handleLyricsSelect = async (e) => {
  console.log('处理歌词选择')
  const file = e.target.files[0]
  if (!file) {
    console.log('没有选择文件')
    return
  }

  console.log('选择的歌词文件:', file.name)

  try {
    const content = await readLyricsFile(file)
    console.log('歌词内容读取成功，长度:', content.length)
    const preview = content.split('\n').slice(0, 3).join('\n') + '...'
    const lyricsId = generateId()

    // 添加到待处理文件列表
    const lyricsInfo = {
      id: lyricsId,
      type: 'lyrics',
      file: file,
      name: file.name,
      content: content,
      preview: preview,
      fileSize: formatFileSize(file.size)
    }

    pendingFiles.value.push(lyricsInfo)
    console.log('歌词文件已添加到待处理列表')

    // 如果是为特定音频文件上传歌词，自动选择
    if (currentUploadingIndex.value >= 0) {
      const audioFile = pendingFiles.value.find((f, index) =>
        f.type === 'audio' && index === currentUploadingIndex.value
      )
      if (audioFile) {
        audioFile.selectedLyrics = lyricsId
        console.log('已自动为音频文件选择歌词')
      }
    }

  } catch (error) {
    errorMessage.value = '歌词上传失败，请重试'
    console.error('歌词上传错误:', error)
  } finally {
    currentUploadingIndex.value = -1
    e.target.value = ''
  }
}

// 处理文件
const processFiles = async (files) => {
  if (files.length === 0) return
  
  isUploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''
  
  try {
    const { audioFiles, imageFiles, lyricsFiles, invalidFiles } = validateUploadedFiles(files)

    if (invalidFiles.length > 0) {
      errorMessage.value = `不支持的文件格式: ${invalidFiles.map(f => f.name).join(', ')}`
    }

    const totalFiles = audioFiles.length + imageFiles.length + lyricsFiles.length
    let processedFiles = 0
    
    // 处理音频文件
    for (const audioFile of audioFiles) {
      try {
        const metadata = await extractAudioMetadata(audioFile)
        const audioURL = createFileURL(audioFile)
        
        pendingFiles.value.push({
          id: generateId(),
          type: 'audio',
          file: audioFile,
          name: audioFile.name,
          url: audioURL,
          selectedCover: '',
          selectedLyrics: '',
          ...metadata
        })
        
        processedFiles++
        uploadProgress.value = Math.round((processedFiles / totalFiles) * 100)
      } catch (error) {
        console.error('处理音频文件失败:', error)
      }
    }
    
    // 处理图片文件
    for (const imageFile of imageFiles) {
      try {
        const imageURL = await fileToDataURL(imageFile)

        pendingFiles.value.push({
          id: generateId(),
          type: 'image',
          file: imageFile,
          name: imageFile.name,
          url: imageURL,
          fileSize: imageFile.size
        })

        processedFiles++
        uploadProgress.value = Math.round((processedFiles / totalFiles) * 100)
      } catch (error) {
        console.error('处理图片文件失败:', error)
      }
    }

    // 处理歌词文件
    for (const lyricsFile of lyricsFiles) {
      try {
        const content = await readLyricsFile(lyricsFile)
        const preview = content.split('\n').slice(0, 3).join('\n') + '...'

        pendingFiles.value.push({
          id: generateId(),
          type: 'lyrics',
          file: lyricsFile,
          name: lyricsFile.name,
          content: content,
          preview: preview,
          fileSize: lyricsFile.size
        })

        processedFiles++
        uploadProgress.value = Math.round((processedFiles / totalFiles) * 100)
      } catch (error) {
        console.error('处理歌词文件失败:', error)
      }
    }
    
  } catch (error) {
    errorMessage.value = '文件处理失败，请重试'
    console.error('文件处理错误:', error)
  } finally {
    isUploading.value = false
  }
}

// 读取歌词文件内容
const readLyricsFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let content = e.target.result

        // 检测编码并转换
        if (file.name.toLowerCase().endsWith('.lrc')) {
          // LRC格式歌词，保持原格式
          resolve(content)
        } else {
          // 普通文本格式，转换为简单的LRC格式
          const lines = content.split('\n')
          const lrcContent = lines
            .filter(line => line.trim())
            .map((line, index) => `[${String(Math.floor(index * 5 / 60)).padStart(2, '0')}:${String(index * 5 % 60).padStart(2, '0')}.00]${line.trim()}`)
            .join('\n')
          resolve(lrcContent)
        }
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file, 'utf-8')
  })
}

// 移除待处理文件
const removePendingFile = (index) => {
  const fileInfo = pendingFiles.value[index]
  if (fileInfo.url && fileInfo.type === 'audio') {
    URL.revokeObjectURL(fileInfo.url)
  }
  pendingFiles.value.splice(index, 1)
}

// 清空待处理文件
const clearPendingFiles = () => {
  pendingFiles.value.forEach(fileInfo => {
    if (fileInfo.url && fileInfo.type === 'audio') {
      URL.revokeObjectURL(fileInfo.url)
    }
  })
  pendingFiles.value = []
}

// 确认上传
const confirmUpload = () => {
  if (pendingFiles.value.length === 0) return

  // 验证音频文件是否有必要的信息
  const audioFiles = pendingFiles.value.filter(f => f.type === 'audio')
  const invalidFiles = audioFiles.filter(f =>
    !f.title?.trim() || !f.artist?.trim()
  )

  if (invalidFiles.length > 0) {
    errorMessage.value = '请为所有音频文件填写完整信息（歌曲名称、歌手）'
    return
  }

  // 为每个音频文件添加对应的歌词内容
  const processedFiles = pendingFiles.value.map(file => {
    if (file.type === 'audio' && file.selectedLyrics) {
      const lyricsFile = pendingFiles.value.find(f => f.id === file.selectedLyrics)
      console.log('为音频文件添加歌词:', file.title, '歌词ID:', file.selectedLyrics)
      console.log('找到的歌词文件:', lyricsFile?.name)
      return {
        ...file,
        lyricsContent: lyricsFile?.content || null
      }
    }
    return file
  })

  console.log('处理后的文件列表:', processedFiles)
  emit('files-uploaded', processedFiles)
  clearPendingFiles()
}

// 清除错误信息
const clearError = () => {
  errorMessage.value = ''
}

// 测试歌词上传
const testLyricsUpload = () => {
  console.log('测试歌词上传按钮被点击')
  currentUploadingIndex.value = -1 // 不关联特定音频文件

  setTimeout(() => {
    if (lyricsInput.value) {
      console.log('找到lyricsInput，触发点击')
      lyricsInput.value.click()
    } else {
      console.error('lyricsInput ref 未找到')
    }
  }, 100)
}

// 批量导入文件夹
const triggerFolderSelect = () => {
  if (folderInput.value) {
    folderInput.value.click()
  }
}

// 处理文件夹选择
const handleFolderSelect = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) {
    return
  }

  isBatchScanning.value = true
  batchProgress.value = 0
  scannedCount.value = 0
  foundAudioCount.value = 0
  batchStatusText.value = '正在扫描文件夹...'

  try {
    // 过滤出音频文件
    const audioFiles = []
    Array.from(files).forEach(file => {
      scannedCount.value++
      if (isAudioFileByName(file.name)) {
        audioFiles.push(file)
        foundAudioCount.value++
      }
    })

    if (audioFiles.length === 0) {
      alert('在选择的文件夹中没有找到音频文件')
      return
    }

    batchStatusText.value = '正在处理音频文件...'
    await processBatchAudioFiles(audioFiles)

    batchStatusText.value = `批量导入完成！共处理 ${audioFiles.length} 个音频文件`

    // 延迟隐藏进度条
    setTimeout(() => {
      isBatchScanning.value = false
    }, 2000)

  } catch (error) {
    console.error('处理文件夹失败:', error)
    setError('处理文件夹失败: ' + error.message)
  } finally {
    // 清空input值，允许重复选择同一文件夹
    event.target.value = ''

    if (isBatchScanning.value) {
      setTimeout(() => {
        isBatchScanning.value = false
      }, 1000)
    }
  }
}



// 检查文件名是否为音频文件
const isAudioFileByName = (filename) => {
  const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.wma', '.mp4']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return audioExtensions.includes(ext)
}

// 批量处理音频文件
const processBatchAudioFiles = async (audioFiles) => {
  const totalFiles = audioFiles.length

  for (let i = 0; i < totalFiles; i++) {
    const file = audioFiles[i]

    batchStatusText.value = `正在处理: ${file.name} (${i + 1}/${totalFiles})`
    batchProgress.value = 50 + ((i + 1) / totalFiles) * 50 // 处理阶段占50%

    try {
      // 提取音频元数据
      const metadata = await extractAudioMetadata(file)

      // 创建文件信息对象
      const fileInfo = {
        id: generateId(),
        file: file,
        name: file.name,
        type: 'audio',
        size: formatFileSize(file.size),
        url: createFileURL(file),
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
        artist: metadata.artist || '未知艺术家',
        album: metadata.album || '',
        duration: metadata.duration || 0,
        cover: null,
        lrcFile: null,
        webkitRelativePath: file.webkitRelativePath || file.name
      }

      // 添加到待处理列表
      pendingFiles.value.push(fileInfo)

    } catch (error) {
      console.warn('处理音频文件失败:', file.name, error)
    }

    // 小延迟以避免阻塞UI
    if (i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
}
</script>

<style scoped>
.upload-section {
  margin-bottom: 0;
}

.upload-header {
  text-align: center;
  margin-bottom: 16px;
}

.upload-header h2 {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 6px;
}

.upload-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.4;
}

.drop-zone {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.drop-zone.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 36px;
  opacity: 0.7;
}

.upload-text h3 {
  color: #fff;
  margin: 0 0 6px 0;
  font-size: 16px;
}

.upload-text p {
  color: rgba(255, 255, 255, 0.6);
  margin: 2px 0;
  font-size: 12px;
  line-height: 1.3;
}

.upload-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.upload-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.batch-import-button {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.batch-import-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
}

.batch-progress {
  margin-top: 16px;
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
}

.batch-progress .progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.batch-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.batch-progress p {
  color: #4CAF50;
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
}

.batch-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.batch-stats span {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.upload-progress {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.file-preview {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.file-preview h3 {
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.file-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
}

.file-item.audio-file {
  flex-direction: column;
  align-items: stretch;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 24px;
}

.file-details h4 {
  color: #fff;
  margin: 0 0 4px 0;
  font-size: 14px;
}

.file-details p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 12px;
}

.file-meta {
  color: rgba(255, 255, 255, 0.5) !important;
}

.audio-inputs {
  width: 100%;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.input-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.song-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 14px;
}

.song-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.song-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.cover-select {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 14px;
  margin-right: 8px;
}

.cover-select:focus {
  outline: none;
  border-color: #667eea;
}

.cover-select option {
  background: #333;
  color: #fff;
}

.upload-cover-btn,
.upload-lyrics-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.upload-cover-btn:hover,
.upload-lyrics-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.upload-lyrics-btn {
  background: linear-gradient(45deg, #22c55e, #16a34a);
}

.upload-lyrics-btn:hover {
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.image-info h4,
.lyrics-info h4 {
  color: #fff;
  margin: 0 0 4px 0;
  font-size: 14px;
}

.lyrics-info {
  max-width: 100%;
}

.lyrics-preview {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
  white-space: pre-line;
  max-height: 60px;
  overflow: hidden;
  font-family: monospace;
}

.remove-button {
  background: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background: rgba(255, 0, 0, 0.3);
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.cancel-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-button:disabled,
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  color: #ff6b6b;
  margin: 0;
  font-size: 14px;
}

.error-message button {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 14px;
}
</style>
