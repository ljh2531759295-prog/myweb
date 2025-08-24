<template>
  <!-- 遮罩层 -->
  <div class="modal-overlay" @click="closeModal">
    <!-- 弹窗内容 -->
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>添加音乐</h2>
        <button class="close-button" @click="closeModal">
          <span>✕</span>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- 文件上传组件 -->
        <FileUpload @files-uploaded="handleFilesUploaded" />
      </div>
    </div>
  </div>
</template>

<script setup>
import FileUpload from './FileUpload.vue'

const emit = defineEmits(['close', 'files-uploaded'])

const closeModal = () => {
  emit('close')
}

const handleFilesUploaded = (files) => {
  emit('files-uploaded', files)
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
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 20px;
}

.modal-header h2 {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: scale(1.1);
}

.close-button span {
  font-size: 16px;
  line-height: 1;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 自定义滚动条 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
    max-height: calc(100vh - 40px);
  }
  
  .modal-header {
    padding: 20px 20px 0 20px;
  }
  
  .modal-header h2 {
    font-size: 1.3rem;
  }
  
  .modal-body {
    padding: 0 20px 20px 20px;
  }
}
</style>
