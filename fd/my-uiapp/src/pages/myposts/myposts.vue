<template>
  <view class="myposts-container">
    <view class="myposts-header">
      <text class="myposts-title">我发布的</text>
    </view>
    
    <scroll-view class="content" scroll-y>
      <view v-if="myPosts.length === 0" class="empty-state">
        <text class="empty-text">还没有发布任何帖子</text>
        <button class="empty-button" @click="goToPublish">去发布</button>
      </view>
      
      <view class="article-list" v-else>
        <view 
          class="article-card" 
          v-for="(article, index) in myPosts" 
          :key="article.id || index"
          @click="viewArticle(article)"
        >
          <view class="article-header">
            <text class="article-title">{{ article.title }}</text>
            <text class="article-time">{{ article.createTime }}</text>
          </view>
          <text class="article-desc">{{ article.description }}</text>
          <view class="article-footer">
            <view class="category-tag" :class="'category-' + article.category">
              {{ getCategoryName(article.category) }}
            </view>
            <view class="article-actions">
              <text class="action-btn" @click.stop="editArticle(article, index)">编辑</text>
              <text class="action-btn delete" @click.stop="deleteArticle(article, index)">删除</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { articleApi } from '../../utils/api.js'

export default {
  data() {
    return {
      myPosts: []
    }
  },
  onLoad() {
    this.loadMyPosts()
  },
  onShow() {
    // 每次显示页面时重新加载
    this.loadMyPosts()
  },
  methods: {
    loadMyPosts() {
      const user = uni.getStorageSync('user')
      if (!user) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        return
      }
      
      uni.showLoading({
        title: '加载中...'
      })
      
      // 从API获取我发布的文章
      articleApi.getMyPosts({
        page: 1,
        pageSize: 100
      }).then(data => {
        uni.hideLoading()
        if (data && data.list) {
          this.myPosts = data.list.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            createTime: item.createTime,
            viewCount: item.viewCount || 0
          }))
        }
      }).catch(error => {
        uni.hideLoading()
        console.error('加载失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'none'
        })
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
    viewArticle(article) {
      // 使用文章ID跳转到详情页
      if (article.id) {
        uni.navigateTo({
          url: `/pages/detail/detail?id=${article.id}`
        })
      } else {
        uni.showToast({
          title: '文章ID不存在',
          icon: 'none'
        })
      }
    },
    editArticle(article, index) {
      if (article && article.id) {
        uni.navigateTo({
          url: `/pages/edit/edit?id=${article.id}`
        })
      } else {
        uni.showToast({
          title: '无法编辑此文章',
          icon: 'none'
        })
      }
    },
    deleteArticle(article, index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这篇文章吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            })
            
            // 调用删除接口
            articleApi.delete(article.id)
              .then(() => {
                uni.hideLoading()
                // 从列表中删除
                this.myPosts.splice(index, 1)
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              })
              .catch((error) => {
                uni.hideLoading()
                uni.showToast({
                  title: error.message || '删除失败',
                  icon: 'none'
                })
              })
          }
        }
      })
    },
    goToPublish() {
      uni.navigateTo({
        url: '/pages/publish/publish'
      })
    }
  }
}
</script>

<style scoped>
.myposts-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.myposts-header {
  background: #2d8659;
  padding-top: var(--status-bar-height);
  padding: 24rpx 30rpx;
  padding-top: calc(var(--status-bar-height) + 24rpx);
}

.myposts-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.empty-button {
  width: 200rpx;
  height: 72rpx;
  background: #2d8659;
  color: #ffffff;
  font-size: 28rpx;
  border-radius: 36rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.article-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.article-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14rpx;
  gap: 12rpx;
}

.article-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
  line-height: 1.5;
}

.article-time {
  font-size: 22rpx;
  color: #999999;
  flex-shrink: 0;
  white-space: nowrap;
}

.article-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 18rpx;
  display: block;
}

.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-tag {
  padding: 8rpx 20rpx;
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

.article-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  font-size: 24rpx;
  color: #2d8659;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background: rgba(45, 134, 89, 0.1);
}

.action-btn.delete {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}
</style>
