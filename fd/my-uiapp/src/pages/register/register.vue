<template>
  <view class="register-container">
    <view class="register-box">
      <view class="register-header">
        <text class="register-title">创建账号</text>
        <text class="register-subtitle">请填写您的注册信息</text>
      </view>
      
      <view class="register-form">
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
        
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input
              class="input-field"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              v-model="formData.confirmPassword"
              :maxlength="20"
            />
            <text class="password-toggle" @click="toggleConfirmPassword">
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </text>
          </view>
        </view>
        
        <button
          class="register-button"
          :class="{ 'disabled': !canRegister }"
          :disabled="!canRegister"
          @click="handleRegister"
        >
          注册
        </button>
        
        <view class="register-footer">
          <text class="register-link" @click="goToLogin">
            已有账号？去登录
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
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      showConfirmPassword: false
    }
  },
  computed: {
    canRegister() {
      return this.formData.username.trim() !== '' && 
             this.formData.password.trim() !== '' && 
             this.formData.confirmPassword.trim() !== ''
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    handleRegister() {
      if (!this.canRegister) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      // 验证密码长度
      if (this.formData.password.length < 6) {
        uni.showToast({
          title: '密码至少6位',
          icon: 'none'
        })
        return
      }
      
      // 验证两次密码是否一致
      if (this.formData.password !== this.formData.confirmPassword) {
        uni.showToast({
          title: '两次密码不一致',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '注册中...'
      })
      
      // 调用注册接口
      userApi.register(this.formData.username, this.formData.password)
        .then(() => {
          uni.hideLoading()
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
          
          // 注册成功后跳转到登录页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        })
        .catch((error) => {
          uni.hideLoading()
          uni.showToast({
            title: error.message || '注册失败',
            icon: 'none'
          })
        })
    },
    goToLogin() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.register-box {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.register-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.register-subtitle {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

.register-form {
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

.register-button {
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

.register-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);
}

.register-button.disabled {
  background: #cccccc;
  box-shadow: none;
  opacity: 0.6;
}

.register-footer {
  text-align: center;
  margin-top: 40rpx;
}

.register-link {
  font-size: 28rpx;
  color: #667eea;
  text-decoration: underline;
}
</style>
