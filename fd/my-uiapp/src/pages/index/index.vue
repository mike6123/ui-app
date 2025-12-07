<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-top">
        <text class="logo-text">vue论坛</text>
        <view class="header-right">
          <view class="nav-links">
            <text class="nav-link">首页</text>
            <view class="nav-link-dropdown" @click.stop="toggleCategoryMenu">
              <text class="nav-link">分类</text>
              <text class="dropdown-arrow" :class="{ 'rotate': showCategoryMenu }">▼</text>
              <view class="category-dropdown" v-if="showCategoryMenu" @click.stop>
                <view class="dropdown-item" @click="filterByCategory('all')">全部</view>
                <view class="dropdown-item" @click="filterByCategory('life')">生活</view>
                <view class="dropdown-item" @click="filterByCategory('food')">美食</view>
                <view class="dropdown-item" @click="filterByCategory('tech')">技术</view>
              </view>
            </view>
          </view>
          <view class="search-box" @click="handleSearch">
            <text class="search-placeholder">搜索文章/作者...</text>
            <text class="search-btn">搜索</text>
          </view>
          <view class="avatar-wrapper">
            <view class="avatar" @click.stop="toggleUserMenu">
              <text class="avatar-icon">👤</text>
            </view>
            <view class="user-dropdown" v-if="showUserMenu" @click.stop>
              <view class="dropdown-item user-name">{{ userName }}</view>
              <view class="dropdown-item" @click="handleLogout">退出登录</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 遮罩层 -->
    <view class="mask" v-if="showCategoryMenu || showUserMenu" @click="closeMenus"></view>

    <!-- 文章列表 -->
    <scroll-view class="content" scroll-y>
      <view class="article-list">
        <view 
          class="article-card" 
          v-for="(article, index) in filteredArticles" 
          :key="index"
          @click="viewArticle(article, index)"
        >
          <view class="article-header">
            <text class="article-title">{{ article.title }}</text>
            <text class="article-author">{{ article.author }}</text>
          </view>
          <text class="article-desc">{{ article.description }}</text>
          <view class="article-footer">
            <view class="category-tag" :class="'category-' + article.category">
              {{ getCategoryName(article.category) }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部导航栏 -->
    <view class="bottom-nav">
      <view class="nav-item" @click="goToMyPosts">
        <text class="nav-icon">✓</text>
        <text class="nav-text">我发布的</text>
      </view>
      <view class="nav-item publish-btn" @click="goToPublish">
        <text class="nav-icon">+</text>
        <text class="nav-text">发布帖子</text>
      </view>
      <view class="nav-item" @click="goToLogin">
        <text class="nav-icon">🕐</text>
        <text class="nav-text">登录页</text>
      </view>
    </view>
  </view>
</template>

<script>
import { articleApi, userApi } from '../../utils/api.js'

export default {
  data() {
    return {
      showCategoryMenu: false,
      showUserMenu: false,
      currentCategory: 'all',
      userName: '用户',
      articles: []
    }
  },
  computed: {
    filteredArticles() {
      if (this.currentCategory === 'all') {
        return this.articles
      }
      return this.articles.filter(article => article.category === this.currentCategory)
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadArticles()
  },
  onShow() {
    this.loadUserInfo()
    this.loadArticles()
  },
  onPullDownRefresh() {
    // 下拉刷新
    this.loadArticles().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const user = uni.getStorageSync('user')
      if (user && user.username) {
        this.userName = user.username
      } else {
        // 尝试从API获取用户信息
        userApi.getUserInfo().then(userInfo => {
          this.userName = userInfo.username
          uni.setStorageSync('user', userInfo)
        }).catch(() => {
          // 获取失败，使用默认值
        })
      }
    },
    // 加载文章列表
    loadArticles() {
      return articleApi.getList({
        page: 1,
        pageSize: 100,
        category: this.currentCategory === 'all' ? 'all' : this.currentCategory
      }).then(data => {
        if (data && data.list) {
          // 转换数据格式，将id映射为前端使用的格式
          this.articles = data.list.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            author: item.author,
            authorId: item.authorId,
            createTime: item.createTime,
            viewCount: item.viewCount || 0
          }))
        }
      }).catch(error => {
        console.error('加载文章列表失败:', error)
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
    handleSearch() {
      uni.showToast({
        title: '搜索功能开发中',
        icon: 'none'
      })
    },
    toggleCategoryMenu() {
      this.showCategoryMenu = !this.showCategoryMenu
      this.showUserMenu = false
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      this.showCategoryMenu = false
    },
    closeMenus() {
      this.showCategoryMenu = false
      this.showUserMenu = false
    },
    filterByCategory(category) {
      this.currentCategory = category
      this.showCategoryMenu = false
      this.loadArticles()
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            userApi.logout().then(() => {
              uni.reLaunch({
                url: '/pages/login/login'
              })
            }).catch(() => {
              // 即使API调用失败，也清除本地数据并跳转
              uni.removeStorageSync('user')
              uni.reLaunch({
                url: '/pages/login/login'
              })
            })
          }
        }
      })
      this.showUserMenu = false
    },
    viewArticle(article, index) {
      // 使用文章ID跳转
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
    goToMyPosts() {
      uni.navigateTo({
        url: '/pages/myposts/myposts'
      })
    },
    goToPublish() {
      uni.navigateTo({
        url: '/pages/publish/publish'
      })
    },
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

/* 顶部导航栏 */
.header {
  background: #2d8659;
  padding-top: var(--status-bar-height);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  gap: 12rpx;
}

.logo-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  justify-content: flex-end;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-link {
  font-size: 26rpx;
  color: #ffffff;
  white-space: nowrap;
}

.nav-link-dropdown {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.dropdown-arrow {
  font-size: 18rpx;
  color: #ffffff;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8rpx;
  padding: 10rpx 14rpx;
  gap: 10rpx;
  flex: 1;
  min-width: 180rpx;
  max-width: 280rpx;
}

.search-placeholder {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-btn {
  font-size: 22rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  white-space: nowrap;
}

.avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 26rpx;
}

.avatar-wrapper {
  position: relative;
}

/* 下拉菜单样式 */
.nav-link-dropdown {
  position: relative;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8rpx;
  background: #ffffff;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  min-width: 120rpx;
  z-index: 200;
  overflow: hidden;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8rpx;
  background: #ffffff;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  min-width: 160rpx;
  z-index: 200;
  overflow: hidden;
}

.dropdown-item {
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  color: #333333;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background 0.3s;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background: #f5f5f5;
}

.dropdown-item.user-name {
  color: #2d8659;
  font-weight: bold;
  background: #f8f8f8;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-arrow {
  transition: transform 0.3s;
}

/* 遮罩层 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 150;
  background: transparent;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
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

.article-author {
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

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #2d8659;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  padding: 10rpx;
  transition: all 0.3s;
}

.nav-item:active {
  opacity: 0.7;
}

.nav-icon {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: normal;
}

.nav-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

.publish-btn {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12rpx;
  margin: 0 10rpx;
}

.publish-btn .nav-text {
  color: #ffffff;
  font-weight: bold;
}
</style>