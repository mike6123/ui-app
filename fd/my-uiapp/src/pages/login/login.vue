<template>
  <view class="login-container">
    <view class="login-box">
      <view class="login-header">
        <text class="login-title">欢迎登录</text>
        <text class="login-subtitle">请输入您的账号和密码</text>
      </view>
      
      <view class="login-form">
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input
              class="input-field"
              type="text"
              placeholder="请输入账号"
              v-model="formData.username"
              :maxlength="20"
            />
          </view>
        </view>
        
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input
              class="input-field"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              v-model="formData.password"
              :maxlength="20"
            />
            <text class="password-toggle" @click="togglePassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </text>
          </view>
        </view>
        
        <button
          class="login-button"
          :class="{ 'disabled': !canLogin }"
          :disabled="!canLogin"
          @click="handleLogin"
        >
          登录
        </button>
        
        <view class="login-footer">
          <text class="register-link" @click="goToRegister">
            还没有账号？立即注册
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { userApi } from '../../utils/api.js'

export default {
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      showPassword: false
    }
  },
  computed: {
    canLogin() {
      return this.formData.username.trim() !== '' && this.formData.password.trim() !== ''
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    },
    handleLogin() {
      if (!this.canLogin) {
        uni.showToast({
          title: '请输入账号和密码',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '登录中...'
      })
      
      // 调用登录接口
      userApi.login(this.formData.username, this.formData.password)
        .then((data) => {
          uni.hideLoading()
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 登录成功后跳转到首页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
        })
        .catch((error) => {
          uni.hideLoading()
          uni.showToast({
            title: error.message || '登录失败',
            icon: 'none'
          })
        })
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-box {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.login-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.login-subtitle {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 32rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 88rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  background: #ffffff;
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.input-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
  height: 100%;
}

.input-field::placeholder {
  color: #999999;
}

.password-toggle {
  font-size: 36rpx;
  margin-left: 16rpx;
  cursor: pointer;
  flex-shrink: 0;
  padding: 8rpx;
}

.login-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 12rpx;
  border: none;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.login-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);
}

.login-button.disabled {
  background: #cccccc;
  box-shadow: none;
  opacity: 0.6;
}

.login-footer {
  text-align: center;
  margin-top: 40rpx;
}

.register-link {
  font-size: 28rpx;
  color: #667eea;
  text-decoration: underline;
}
</style>
