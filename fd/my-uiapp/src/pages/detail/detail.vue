<template>
  <view class="detail-container">
      <view class="detail-header">
      <view class="header-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">文章详情</text>
      <view class="header-actions">
        <view class="edit-btn" v-if="canEdit" @click="goToEdit">
          <text class="edit-text">编辑</text>
        </view>
        <view class="header-placeholder" v-else></view>
      </view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <view v-if="article" class="article-detail">
        <view class="article-title">{{ article.title }}</view>
        
        <view class="article-meta">
          <view class="meta-item">
            <text class="meta-label">作者：</text>
            <text class="meta-value">{{ article.author }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">分类：</text>
            <view class="category-tag" :class="'category-' + article.category">
              {{ getCategoryName(article.category) }}
            </view>
          </view>
          <view class="meta-item" v-if="article.createTime">
            <text class="meta-label">时间：</text>
            <text class="meta-value">{{ article.createTime }}</text>
          </view>
        </view>
        
        <view class="article-description">
          <text class="desc-label">简介：</text>
          <text class="desc-text">{{ article.description }}</text>
        </view>
        
        <view class="article-content">
          <text class="content-label">内容：</text>
          <text class="content-text">{{ article.content || '暂无详细内容' }}</text>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <text class="empty-text">文章不存在</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { articleApi } from '../../utils/api.js'

export default {
  data() {
    return {
      article: null,
      articleIndex: -1,
      currentUser: null
    }
  },
  computed: {
    canEdit() {
      // 只有作者本人才能编辑
      return this.article && this.currentUser && 
             (this.article.authorId === this.currentUser.userId || 
              this.article.author === this.currentUser.username)
    }
  },
  onLoad(options) {
    // 获取当前用户
    this.currentUser = uni.getStorageSync('user')
    
    // 获取文章ID
    const articleId = options.id ? parseInt(options.id) : null
    
    if (!articleId) {
      uni.showToast({
        title: '文章ID不存在',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }
    
    // 从API加载文章详情
    this.loadArticle(articleId)
  },
  methods: {
    loadArticle(articleId) {
      uni.showLoading({
        title: '加载中...'
      })
      
      articleApi.getDetail(articleId)
        .then(article => {
          uni.hideLoading()
          this.article = article
        })
        .catch(error => {
          uni.hideLoading()
          uni.showToast({
            title: error.message || '加载失败',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        })
    },
    getCategoryName(category) {
      const names = {
        'life': '生活',
        'food': '美食',
        'tech': '技术'
      }
      return names[category] || category
    },
    goBack() {
      uni.navigateBack()
    },
    goToEdit() {
      if (this.article && this.article.id) {
        uni.navigateTo({
          url: `/pages/edit/edit?id=${this.article.id}`
        })
      } else {
        uni.showToast({
          title: '无法编辑此文章',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.detail-header {
  background: #2d8659;
  padding-top: var(--status-bar-height);
  padding: 20rpx 30rpx;
  padding-top: calc(var(--status-bar-height) + 20rpx);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: bold;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  flex: 1;
  text-align: center;
}

.header-placeholder {
  width: 60rpx;
}

.header-actions {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.edit-btn {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
}

.edit-text {
  font-size: 26rpx;
  color: #ffffff;
}

.content {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

.article-detail {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.article-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1.5;
  margin-bottom: 30rpx;
}

.article-meta {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
  margin-bottom: 30rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-label {
  font-size: 26rpx;
  color: #666666;
}

.meta-value {
  font-size: 26rpx;
  color: #333333;
}

.category-tag {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
  display: inline-block;
}

.category-life {
  background: #4CAF50;
}

.category-food {
  background: #FF9800;
}

.category-tech {
  background: #2196F3;
}

.article-description {
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.desc-label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.desc-text {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

.article-content {
  margin-bottom: 20rpx;
}

.content-label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.content-text {
  display: block;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
