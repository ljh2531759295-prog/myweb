<template>


  <div class="container" :class="{ 'right-panel-active': isRightPanelActive }" >
    <!-- 注册面板 -->
    <div class="form-container sign-up-container">
      <form @submit.prevent="register">
        <h2>创建账号</h2>
        <div class="register-options">
          <input type="text" v-model="registerForm.name" placeholder="姓名" />
          <div v-if="registerErrors.name" class="error-message">{{ registerErrors.name }}</div>
          <input type="email" v-model="registerForm.email" placeholder="邮箱" />
          <div v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</div>
          <input type="password" v-model="registerForm.password" placeholder="密码" />
          <div v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</div>
        </div>
        <button type="submit">注册</button>
      </form>
    </div>


    <!-- 登录面板 -->
    <div class="form-container sign-in-container">
      <form @submit.prevent="login">
        <h2>登录</h2>
        <div class="social-container">
          <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
          <a href="#" class="social"><i class="fab fa-linkedin-in"></i></a>
        </div>
        <span>或使用您的账号</span>
        <div class="login-options">
          <input type="email" v-model="loginForm.email" placeholder="邮箱" />
          <div v-if="loginErrors.email" class="error-message">{{ loginErrors.email }}</div>
          <input type="password" v-model="loginForm.password" placeholder="密码" />
          <div v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</div>
          <a href="#">忘记密码？</a>
        </div>
        <button type="submit" @click="$router.push('/vip/info')">登录</button>
      </form>
    </div>

    <!-- 覆盖面板 -->
    <div class="overlay-container">
      <div class="overlay">
        <div class="overlay-panel overlay-left">
          <h2>欢迎回来！</h2>
          <p>请使用您的账号登录以继续访问</p>
          <button class="ghost" @click="togglePanel(false)">登录</button>
        </div>
        <div class="overlay-panel overlay-right">
          <h2>你好，新朋友！</h2>
          <p>输入您的个人信息注册账号</p>
          <button class="ghost" @click="togglePanel(true)">注册</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginRegister',
  data() {
    return {
      isRightPanelActive: false,
      loginForm: {
        email: '',
        password: ''
      },
      loginErrors: {
        email: '',
        password: ''
      },
      registerForm: {
        name: '',
        email: '',
        password: ''
      },
      registerErrors: {
        name: '',
        email: '',
        password: ''
      }
    };
  },
  methods: {
    togglePanel(isRight) {
      this.isRightPanelActive = isRight;
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    login() {
      // 重置错误信息
      this.loginErrors = {
        email: '',
        password: ''
      };

      let isValid = true;

      // 验证邮箱
      if (!this.loginForm.email) {
        this.loginErrors.email = '请输入邮箱';
        isValid = false;
      } else if (!this.validateEmail(this.loginForm.email)) {
        this.loginErrors.email = '请输入有效的邮箱地址';
        isValid = false;
      }

      // 验证密码
      if (!this.loginForm.password) {
        this.loginErrors.password = '请输入密码';
        isValid = false;
      } else if (this.loginForm.password.length < 6) {
        this.loginErrors.password = '密码长度不能少于6个字符';
        isValid = false;
      }

      if (isValid) {
        // 在实际应用中，这里会发送请求到服务器进行验证
        console.log('登录表单提交', this.loginForm);
        alert('登录成功！');
        // 可以在这里添加登录成功后的逻辑，如重定向到首页等
      }
    },
    register() {
      // 重置错误信息
      this.registerErrors = {
        name: '',
        email: '',
        password: ''
      };

      let isValid = true;

      // 验证姓名
      if (!this.registerForm.name) {
        this.registerErrors.name = '请输入姓名';
        isValid = false;
      }

      // 验证邮箱
      if (!this.registerForm.email) {
        this.registerErrors.email = '请输入邮箱';
        isValid = false;
      } else if (!this.validateEmail(this.registerForm.email)) {
        this.registerErrors.email = '请输入有效的邮箱地址';
        isValid = false;
      }

      // 验证密码
      if (!this.registerForm.password) {
        this.registerErrors.password = '请输入密码';
        isValid = false;
      } else if (this.registerForm.password.length < 6) {
        this.registerErrors.password = '密码长度不能少于6个字符';
        isValid = false;
      }

      if (isValid) {
        // 在实际应用中，这里会发送请求到服务器进行注册
        console.log('注册表单提交', this.registerForm);
        alert('注册成功！');
        // 可以在这里添加注册成功后的逻辑，如自动登录或重定向到登录页等
      }
    }
  }
};
</script>

<style scoped>
/* 基础样式 */
* {
  box-sizing: border-box;

}

.container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
  margin: 120px auto;

}

/* 表单样式 */
form {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}

h1 {
  font-weight: bold;
  margin: 0;
  margin-bottom: 15px;
}

p {
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
}

span {
  font-size: 12px;
  margin-bottom: 15px;
}

a {
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
}

button {
  border-radius: 20px;
  border: 1px solid #ff4b2b;
  background-color: #ff4b2b;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
}

button:active {
  transform: scale(0.95);
}

button:focus {
  outline: none;
}

button.ghost {
  background-color: transparent;
  border-color: #ffffff;
}

input {
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  font-size: 14px;
}

/* 社交图标样式 */
.social-container {
  margin: 20px 0;
}

.social-container a {
  border: 1px solid #dddddd;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
}

/* 登录和注册选项样式 */
.register-options,
.login-options {
  width: 100%;
  margin: 15px 0;
}

.register-options input,
.login-options input {
  margin-bottom: 10px;
}

.login-options a {
  display: block;
  text-align: right;
  margin-top: 10px;
  color: #ff4b2b;
}

/* 表单容器样式 */
.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

/* 动画效果 */
.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%,
  49.99% {
    opacity: 0;
    z-index: 1;
  }

  50%,
  100% {
    opacity: 1;
    z-index: 5;
  }
}

/* 覆盖面板样式 */
.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background: #ff416c;
  background: -webkit-linear-gradient(to right, #ff4b2b, #ff416c);
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

/* 错误信息样式 */
.error-message {
  color: #ff4b2b;
  font-size: 12px;
  margin-top: -5px;
  margin-bottom: 5px;
  text-align: left;
  width: 100%;
}



</style>