<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? '编辑歌单' : '创建歌单' }}</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 歌单名称 -->
          <div class="form-group">
            <label for="playlistName">歌单名称</label>
            <input
              id="playlistName"
              v-model="formData.name"
              type="text"
              placeholder="请输入歌单名称"
              required
              maxlength="50"
            />
          </div>

          <!-- 歌单描述 -->
          <div class="form-group">
            <label for="playlistDescription">歌单描述（可选）</label>
            <textarea
              id="playlistDescription"
              v-model="formData.description"
              placeholder="请输入歌单描述"
              rows="3"
              maxlength="200"
            ></textarea>
          </div>

          <!-- 封面选择 -->
          <div class="form-group">
            <label>歌单封面</label>
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
                <button type="button" @click="useDefaultCover" class="default-btn">
                  <span>🎵</span>
                  使用默认
                </button>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              取消
            </button>
            <button type="submit" class="save-btn" :disabled="!formData.name.trim()">
              {{ isEditing ? '保存' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  playlist: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'close'])

// 表单数据
const formData = ref({
  name: '',
  description: '',
  cover: null
})

// 文件输入引用
const fileInput = ref(null)

// 获取默认封面
function getDefaultCover() {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCA1MCA3Ny4zODU4IDUwIDEwNUM1MCAxMzIuNjE0IDc3LjM4NTggMTYwIDEwNSAxNjBDMTMyLjYxNCAxNjAgMTYwIDEzMi42MTQgMTYwIDEwNUMxNjAgNzcuMzg1OCAxMzIuNjE0IDUwIDEwNSA1MEgxMDBWNTBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMTA1IiBjeT0iMTA1IiByPSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+CjxwYXRoIGQ9Ik0xMDAgODBMMTIwIDEwMEwxMDAgMTIwVjgwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'
}

// 是否为编辑模式
const isEditing = computed(() => !!props.playlist)

// 预览封面
const previewCover = ref(getDefaultCover())

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    cover: null
  }
  previewCover.value = getDefaultCover()
}

// 监听playlist变化，初始化表单
watch(() => props.playlist, (newPlaylist) => {
  if (newPlaylist) {
    formData.value = {
      name: newPlaylist.name || '',
      description: newPlaylist.description || '',
      cover: newPlaylist.cover || null
    }
    previewCover.value = newPlaylist.cover || getDefaultCover()
  } else {
    resetForm()
  }
}, { immediate: true })

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

// 使用默认封面
const useDefaultCover = () => {
  formData.value.cover = null
  previewCover.value = getDefaultCover()
}

// 提交表单
const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    alert('请输入歌单名称')
    return
  }

  const playlistData = {
    name: formData.value.name.trim(),
    description: formData.value.description.trim(),
    cover: formData.value.cover,
    songs: props.playlist?.songs || [],
    createdAt: props.playlist?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  emit('save', playlistData)
}

// 关闭模态框
const closeModal = () => {
  emit('close')
}

// 组件挂载时重置表单
onMounted(() => {
  console.log('CreatePlaylistModal mounted')
  if (!props.playlist) {
    resetForm()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  padding: 0 24px 24px 24px;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.cover-selection {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cover-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.change-cover-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-cover-btn:hover {
  background: #fff;
}

.cover-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.upload-btn,
.default-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover,
.default-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.save-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.save-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c8ef0, #8b5cb8);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
