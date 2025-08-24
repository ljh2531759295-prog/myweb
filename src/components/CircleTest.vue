<template>
  <div class="circle-test-page">
    <h1>圆形元素测试页面</h1>
    <p>用于测试在不同环境中圆形元素是否保持完美圆形</p>
    
    <div class="test-grid">
      <!-- 原始方法 -->
      <div class="test-item">
        <h3>原始方法 (aspect-ratio)</h3>
        <div class="original-circle">
          <img src="/api/placeholder/200/200" alt="测试图片" />
        </div>
      </div>
      
      <!-- padding-bottom方法 -->
      <div class="test-item">
        <h3>Padding-bottom方法</h3>
        <div class="padding-circle">
          <img src="/api/placeholder/200/200" alt="测试图片" />
        </div>
      </div>
      
      <!-- 修复类方法 -->
      <div class="test-item">
        <h3>修复类方法</h3>
        <div class="circle-container">
          <img src="/api/placeholder/200/200" alt="测试图片" class="circle-image" />
        </div>
      </div>
      
      <!-- 强制圆形方法 -->
      <div class="test-item">
        <h3>强制圆形方法</h3>
        <div class="force-circle">
          <img src="/api/placeholder/200/200" alt="测试图片" />
        </div>
      </div>
      
      <!-- 紧急修复方法 -->
      <div class="test-item">
        <h3>紧急修复方法</h3>
        <div class="circle-emergency-fix" style="--circle-size: 200px;">
          <img src="/api/placeholder/200/200" alt="测试图片" />
        </div>
      </div>
      
      <!-- CD动画测试 -->
      <div class="test-item">
        <h3>CD动画测试</h3>
        <div class="circle-container">
          <img 
            src="/api/placeholder/200/200" 
            alt="测试图片" 
            class="circle-image cd-spinning-fixed" 
          />
        </div>
      </div>
    </div>
    
    <!-- 不同容器测试 -->
    <div class="container-tests">
      <h2>不同容器环境测试</h2>
      
      <!-- Flex容器 -->
      <div class="flex-container">
        <h3>Flex容器</h3>
        <div class="flex-test">
          <div class="circle-container">
            <img src="/api/placeholder/150/150" alt="测试图片" class="circle-image" />
          </div>
          <div class="circle-container">
            <img src="/api/placeholder/150/150" alt="测试图片" class="circle-image" />
          </div>
          <div class="circle-container">
            <img src="/api/placeholder/150/150" alt="测试图片" class="circle-image" />
          </div>
        </div>
      </div>
      
      <!-- Grid容器 -->
      <div class="grid-container">
        <h3>Grid容器</h3>
        <div class="grid-test">
          <div class="circle-container">
            <img src="/api/placeholder/120/120" alt="测试图片" class="circle-image" />
          </div>
          <div class="circle-container">
            <img src="/api/placeholder/120/120" alt="测试图片" class="circle-image" />
          </div>
          <div class="circle-container">
            <img src="/api/placeholder/120/120" alt="测试图片" class="circle-image" />
          </div>
          <div class="circle-container">
            <img src="/api/placeholder/120/120" alt="测试图片" class="circle-image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 测试组件，无需额外逻辑
</script>

<style scoped>
.circle-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.test-item {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.test-item h3 {
  margin-bottom: 15px;
  color: #333;
}

/* 原始方法 */
.original-circle {
  width: 200px;
  height: 200px;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  border: 2px solid #007bff;
}

.original-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* padding-bottom方法 */
.padding-circle {
  width: 200px;
  height: 0;
  padding-bottom: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  border: 2px solid #28a745;
}

.padding-circle img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 容器测试样式 */
.container-tests {
  margin-top: 40px;
}

.flex-test {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.flex-test .circle-container {
  width: 150px;
  border: 2px solid #ffc107;
}

.grid-test {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.grid-test .circle-container {
  border: 2px solid #dc3545;
}

/* 测试边框 */
.circle-container,
.force-circle,
.circle-emergency-fix {
  border: 2px solid #6f42c1;
  margin: 0 auto;
  width: 200px;
}

.circle-container {
  border-color: #6f42c1;
}

.force-circle {
  border-color: #fd7e14;
}

.circle-emergency-fix {
  border-color: #e83e8c;
}
</style>
