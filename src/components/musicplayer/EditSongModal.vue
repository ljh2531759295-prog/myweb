<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>编辑歌曲信息</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="saveSong">
          <div class="form-group">
            <label for="title">歌曲标题</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="请输入歌曲标题"
              required
            />
          </div>

          <div class="form-group">
            <label for="artist">艺术家</label>
            <input
              id="artist"
              v-model="formData.artist"
              type="text"
              class="form-input"
              placeholder="请输入艺术家名称"
              required
            />
          </div>

          <!-- 封面选择 -->
          <div class="form-group">
            <label>歌曲封面</label>
            <div class="cover-selection">
              <div class="cover-preview">
                <img :src="previewCover" alt="封面预览" />
                <div class="cover-overlay">
                  <button type="button" @click="triggerFileInput" class="change-cover-btn">
                    更换封面
                  </button>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleCoverChange"
                style="display: none"
              />
              <div class="cover-options">
                <button type="button" @click="triggerFileInput" class="upload-btn">
                  <span>📁</span>
                  上传图片
                </button>
                <button type="button" @click="useOriginalCover" class="default-btn">
                  <span>🔄</span>
                  恢复原封面
                </button>
              </div>
            </div>
          </div>

          <!-- 歌词选择 -->
          <div class="form-group">
            <label>歌词文件</label>
            <div class="lyrics-selection">
              <div class="lyrics-preview" v-if="formData.lrcFile">
                <div class="lyrics-info">
                  <span class="lyrics-filename">{{ formData.lrcFile }}</span>
                  <span class="lyrics-status">已有歌词文件</span>
                </div>
              </div>
              <div v-else class="lyrics-empty">
                <div class="empty-icon">📝</div>
                <p>暂无歌词文件</p>
              </div>
              <input
                ref="lyricsInput"
                type="file"
                accept=".lrc,.LRC,.txt,.TXT"
                @change="handleLyricsChange"
                style="display: none"
              />
              <div class="lyrics-options">
                <button type="button" @click="triggerLyricsInput" class="upload-btn lyrics-btn">
                  <span>📝</span>
                  {{ formData.lrcFile ? '更换歌词' : '上传歌词' }}
                </button>
                <button
                  v-if="formData.lrcFile"
                  type="button"
                  @click="removeLyrics"
                  class="remove-btn"
                >
                  <span>🗑️</span>
                  删除歌词
                </button>
                <button
                  v-if="originalLrcFile && originalLrcFile !== formData.lrcFile"
                  type="button"
                  @click="useOriginalLyrics"
                  class="default-btn"
                >
                  <span>🔄</span>
                  恢复原歌词
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn-save">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  song: {
    type: Object,
    default: null
  },
  getCoverUrl: {
    type: Function,
    required: true
  },
  resourceManager: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  title: '',
  artist: '',
  cover: null,
  lrcFile: null
})

// 文件输入引用
const fileInput = ref(null)
const lyricsInput = ref(null)

// 预览封面
const previewCover = ref('')

// 原始封面（用于恢复）
const originalCover = ref('')

// 原始歌词文件（用于恢复）
const originalLrcFile = ref('')

// 监听 song 变化，更新表单数据
watch(() => props.song, (newSong) => {
  try {
    if (newSong) {
      formData.value = {
        title: newSong.title || '',
        artist: newSong.artist || '',
        cover: newSong.cover || null,
        lrcFile: newSong.lrcFile || null
      }
      originalCover.value = newSong.cover || null
      originalLrcFile.value = newSong.lrcFile || null
      previewCover.value = props.getCoverUrl(newSong.cover)
    }
  } catch (error) {
    console.error('更新歌曲数据失败:', error)
    // 设置默认值
    formData.value = {
      title: '',
      artist: '',
      cover: null,
      lrcFile: null
    }
    originalCover.value = null
    originalLrcFile.value = null
    previewCover.value = ''
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理封面变化
const handleCoverChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB限制
      alert('图片大小不能超过5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target.result
      formData.value.cover = result
      previewCover.value = result
    }
    reader.readAsDataURL(file)
  }
}

// 恢复原封面
const useOriginalCover = () => {
  formData.value.cover = originalCover.value
  previewCover.value = props.getCoverUrl(originalCover.value)
}

// 触发歌词文件选择
const triggerLyricsInput = () => {
  lyricsInput.value?.click()
}

// 处理歌词文件变化
const handleLyricsChange = async (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 1 * 1024 * 1024) { // 1MB限制
      alert('歌词文件大小不能超过1MB')
      return
    }

    try {
      // 生成歌词文件名
      const lrcId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      const lrcFileName = `lyrics_${lrcId}.lrc`

      // 保存歌词文件到IndexedDB
      const resourceManager = props.resourceManager
      if (resourceManager) {
        await resourceManager.saveFile(file, 'lyrics', lrcFileName)
        formData.value.lrcFile = lrcFileName
      }
    } catch (error) {
      console.error('保存歌词文件失败:', error)
      alert('保存歌词文件失败，请重试')
    }
  }
}

// 删除歌词
const removeLyrics = () => {
  formData.value.lrcFile = null
}

// 恢复原歌词
const useOriginalLyrics = () => {
  formData.value.lrcFile = originalLrcFile.value
}

const saveSong = () => {
  if (!formData.value.title.trim() || !formData.value.artist.trim()) {
    alert('请填写完整的歌曲信息')
    return
  }

  emit('save', {
    ...props.song,
    title: formData.value.title.trim(),
    artist: formData.value.artist.trim(),
    cover: formData.value.cover,
    lrcFile: formData.value.lrcFile
  })

  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 0 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn-cancel,
.btn-save {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: var(--bg-surface-hover);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--border-light);
  color: var(--text-primary);
}

.btn-save {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
}

/* 封面选择样式 */
.cover-selection,
.lyrics-selection {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cover-preview,
.lyrics-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-light);
}

.lyrics-preview {
  width: 200px;
  background: var(--bg-surface-hover);
}

.lyrics-content {
  width: 100%;
  height: 100%;
  padding: 8px;
  overflow: hidden;
}

.lyrics-content pre {
  margin: 0;
  font-size: 10px;
  line-height: 1.2;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
}

.lyrics-empty {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface-hover);
}

.lyrics-empty .empty-icon {
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.lyrics-empty p {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay,
.lyrics-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-preview:hover .cover-overlay,
.lyrics-preview:hover .lyrics-overlay {
  opacity: 1;
}

.change-cover-btn,
.change-lyrics-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-cover-btn:hover,
.change-lyrics-btn:hover {
  background: #fff;
}

.cover-options,
.lyrics-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.upload-btn,
.default-btn,
.remove-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-surface-hover);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover,
.default-btn:hover {
  background: var(--border-light);
  border-color: var(--border-medium);
  transform: translateY(-1px);
}

.lyrics-btn {
  border-color: #22c55e;
  color: #22c55e;
}

.lyrics-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: #16a34a;
}

.remove-btn {
  border-color: #ef4444;
  color: #ef4444;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #dc2626;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 20px 20px 0;
  }

  .modal-body {
    padding: 0 20px 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}

/* 歌词相关样式 */
.lyrics-info {
  padding: 12px;
  background: var(--bg-surface-hover);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.lyrics-filename {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.lyrics-status {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
