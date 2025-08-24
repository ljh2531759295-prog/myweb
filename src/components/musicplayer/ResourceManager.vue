<template>
  <div class="resource-manager">
    <div class="manager-header">
      <h3>静态资源管理</h3>
      <div class="manager-actions">
        <button @click="refreshAssets" class="refresh-btn">刷新</button>
        <button @click="exportAssets" class="export-btn">导出清单</button>
        <button @click="toggleManager" class="close-btn">关闭</button>
      </div>
    </div>
    
    <div class="assets-section">
      <div class="section-header">
        <h4>🎵 音频文件 ({{ songs.length }})</h4>
      </div>
      <div class="assets-list">
        <div v-if="songs.length === 0" class="empty-message">
          暂无音频文件
        </div>
        <div 
          v-for="song in songs" 
          :key="song.id"
          class="asset-item"
        >
          <div class="asset-info">
            <div class="asset-name">{{ song.originalName }}</div>
            <div class="asset-meta">
              {{ formatFileSize(song.size) }} | {{ formatDate(song.createdAt) }}
            </div>
            <div class="asset-filename">{{ song.filename }}</div>
          </div>
          <div class="asset-actions">
            <button @click="downloadAsset('songs', song.filename)" class="download-btn">
              下载
            </button>
            <button @click="deleteAsset('songs', song.filename)" class="delete-btn">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="assets-section">
      <div class="section-header">
        <h4>🖼️ 封面图片 ({{ covers.length }})</h4>
      </div>
      <div class="assets-list">
        <div v-if="covers.length === 0" class="empty-message">
          暂无封面图片
        </div>
        <div 
          v-for="cover in covers" 
          :key="cover.id"
          class="asset-item"
        >
          <div class="asset-info">
            <div class="asset-name">{{ cover.originalName }}</div>
            <div class="asset-meta">
              {{ formatFileSize(cover.size) }} | {{ formatDate(cover.createdAt) }}
            </div>
            <div class="asset-filename">{{ cover.filename }}</div>
          </div>
          <div class="asset-actions">
            <button @click="downloadAsset('covers', cover.filename)" class="download-btn">
              下载
            </button>
            <button @click="deleteAsset('covers', cover.filename)" class="delete-btn">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="storage-info">
      <p>总计: {{ songs.length + covers.length }} 个文件</p>
      <p>存储位置: 浏览器 IndexedDB</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { resourceManager, formatFileSize } from '@/utils/fileUtils'

const emit = defineEmits(['close', 'assets-changed'])

const songs = ref([])
const covers = ref([])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const refreshAssets = async () => {
  try {
    await resourceManager.init()
    songs.value = await resourceManager.getAllFiles('songs')
    covers.value = await resourceManager.getAllFiles('covers')
  } catch (error) {
    console.error('刷新资源失败:', error)
  }
}

const downloadAsset = async (type, filename) => {
  try {
    await resourceManager.downloadFile(type, filename)
  } catch (error) {
    console.error('下载文件失败:', error)
    alert('下载失败，请重试')
  }
}

const deleteAsset = async (type, filename) => {
  if (!confirm('确定要删除这个文件吗？此操作不可恢复。')) {
    return
  }
  
  try {
    await resourceManager.deleteFile(type, filename)
    await refreshAssets()
    emit('assets-changed')
    alert('文件已删除')
  } catch (error) {
    console.error('删除文件失败:', error)
    alert('删除失败，请重试')
  }
}

const exportAssets = async () => {
  try {
    const assets = await resourceManager.exportAssets()
    const dataStr = JSON.stringify(assets, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `music-assets-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  }
}

const toggleManager = () => {
  emit('close')
}

onMounted(() => {
  refreshAssets()
})
</script>

<style scoped>
.resource-manager {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  z-index: 1000;
  overflow-y: auto;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.manager-header h3 {
  color: #fff;
  margin: 0;
  font-size: 1.5rem;
}

.manager-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn,
.export-btn,
.close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.export-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn {
  background: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.refresh-btn:hover,
.export-btn:hover,
.close-btn:hover {
  transform: translateY(-2px);
}

.assets-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 12px;
}

.section-header h4 {
  color: #fff;
  margin: 0;
  font-size: 1.1rem;
}

.assets-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.empty-message {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px;
  font-style: italic;
}

.asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: background 0.3s ease;
}

.asset-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.asset-item:last-child {
  margin-bottom: 0;
}

.asset-info {
  flex: 1;
}

.asset-name {
  color: #fff;
  font-weight: 500;
  margin-bottom: 4px;
}

.asset-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-bottom: 2px;
}

.asset-filename {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  font-family: monospace;
}

.asset-actions {
  display: flex;
  gap: 8px;
}

.download-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn {
  background: rgba(0, 255, 0, 0.2);
  color: #4ade80;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.delete-btn {
  background: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.download-btn:hover,
.delete-btn:hover {
  transform: translateY(-1px);
}

.storage-info {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.storage-info p {
  margin: 4px 0;
}
</style>
