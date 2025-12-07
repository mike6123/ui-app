<template>
  <view class="publish-container">
    <view class="publish-box">
      <view class="publish-header">
        <text class="publish-title">发布帖子</text>
      </view>
      
      <view class="publish-form">
        <view class="form-item">
          <text class="form-label">标题</text>
          <input
            class="form-input"
            type="text"
            placeholder="请输入帖子标题"
            v-model="formData.title"
            :maxlength="50"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">分类</text>
          <picker
            mode="selector"
            :range="categoryList"
            :range-key="'label'"
            @change="onCategoryChange"
          >
            <view class="picker-view">
              <text :class="formData.category ? 'picker-text' : 'picker-placeholder'">
                {{ formData.category ? getCategoryLabel(formData.category) : '请选择分类' }}
              </text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">描述</text>
          <textarea
            class="form-textarea"
            placeholder="请输入帖子描述"
            v-model="formData.description"
            :maxlength="200"
            :auto-height="true"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">内容</text>
          <textarea
            class="form-textarea content-textarea"
            placeholder="请输入帖子详细内容"
            v-model="formData.content"
            :maxlength="2000"
            :auto-height="true"
          />
        </view>
        
        <button
          class="publish-button"
          :class="{ 'disabled': !canPublish }"
          :disabled="!canPublish"
          @click="handlePublish"
        >
          发布
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { articleApi } from '../../utils/api.js'

export default {
  data() {
    return {
      formData: {
        title: '',
        category: '',
        description: '',
        content: ''
      },
      categoryList: [
        { value: 'life', label: '生活' },
        { value: 'food', label: '美食' },
        { value: 'tech', label: '技术' }
      ]
    }
  },
  computed: {
    canPublish() {
      return this.formData.title.trim() !== '' && 
             this.formData.category !== '' && 
             this.formData.description.trim() !== '' &&
             this.formData.content.trim() !== ''
    }
  },
  onLoad() {
    // 获取用户信息
    const user = uni.getStorageSync('user')
    if (!user) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    onCategoryChange(e) {
      this.formData.category = this.categoryList[e.detail.value].value
    },
    getCategoryLabel(value) {
      const item = this.categoryList.find(item => item.value === value)
      return item ? item.label : ''
    },
    handlePublish() {
      if (!this.canPublish) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '发布中...'
      })
      
      // 调用发布接口
      articleApi.publish({
        title: this.formData.title,
        category: this.formData.category,
        description: this.formData.description,
        content: this.formData.content
      }).then(() => {
        uni.hideLoading()
        uni.showToast({
          title: '发布成功',
          icon: 'success'
        })
        
        // 清空表单
        this.formData = {
          title: '',
          category: '',
          description: '',
          content: ''
        }
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }).catch((error) => {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '发布失败',
          icon: 'none'
        })
      })
    }
  }
}
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.publish-box {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.publish-header {
  margin-bottom: 40rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.publish-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
}

.publish-form {
  width: 100%;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
  border: 2rpx solid transparent;
}

.form-input:focus {
  background: #ffffff;
  border-color: #2d8659;
}

.picker-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  border: 2rpx solid transparent;
}

.picker-view:active {
  background: #ffffff;
  border-color: #2d8659;
}

.picker-text {
  font-size: 28rpx;
  color: #333333;
}

.picker-placeholder {
  font-size: 28rpx;
  color: #999999;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999999;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333333;
  border: 2rpx solid transparent;
  line-height: 1.6;
}

.form-textarea:focus {
  background: #ffffff;
  border-color: #2d8659;
}

.content-textarea {
  min-height: 300rpx;
}

.publish-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #2d8659 0%, #1e5d3f 100%);
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 12rpx;
  border: none;
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(45, 134, 89, 0.3);
  transition: all 0.3s;
}

.publish-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(45, 134, 89, 0.2);
}

.publish-button.disabled {
  background: #cccccc;
  box-shadow: none;
  opacity: 0.6;
}
</style>
