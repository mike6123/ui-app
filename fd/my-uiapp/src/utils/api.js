// API 基础配置
const API_BASE_URL = 'http://127.0.0.1:3000/api'

// 获取Token
function getToken() {
  return uni.getStorageSync('token') || ''
}

// 设置Token
function setToken(token) {
  uni.setStorageSync('token', token)
}

// 移除Token
function removeToken() {
  uni.removeStorageSync('token')
}

// 通用请求函数
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    
    // 设置请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 如果有token，添加到请求头
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    // 处理请求参数
    let data = options.data || {}
    if (options.method === 'GET' && data) {
      // GET请求将data转为query参数
      const query = Object.keys(data)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&')
      url = query ? `${url}?${query}` : url
      data = {}
    }
    
    uni.request({
      url: `${API_BASE_URL}${url}`,
      method: options.method || 'GET',
      data: data,
      header: header,
      success: (res) => {
        if (res.statusCode === 200) {
          const { code, message, data } = res.data
          if (code === 200) {
            resolve(data)
          } else {
            // Token过期或无效
            if (code === 401) {
              removeToken()
              uni.reLaunch({
                url: '/pages/login/login'
              })
            }
            reject(new Error(message || '请求失败'))
          }
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

// 用户相关API
export const userApi = {
  // 注册
  register: (username, password) => {
    return request('/user/register', {
      method: 'POST',
      data: { username, password }
    })
  },
  
  // 登录
  login: (username, password) => {
    return request('/user/login', {
      method: 'POST',
      data: { username, password }
    }).then(data => {
      if (data.token) {
        setToken(data.token)
        // 保存用户信息
        if (data.userInfo) {
          uni.setStorageSync('user', data.userInfo)
        }
      }
      return data
    })
  },
  
  // 退出登录
  logout: () => {
    return request('/user/logout', {
      method: 'POST'
    }).then(() => {
      removeToken()
      uni.removeStorageSync('user')
    })
  },
  
  // 获取用户信息
  getUserInfo: () => {
    return request('/user/info')
  }
}

// 文章相关API
export const articleApi = {
  // 获取文章列表
  getList: (params = {}) => {
    const { page = 1, pageSize = 10, category = 'all' } = params
    return request('/article/list', {
      method: 'GET',
      data: { page, pageSize, category }
    })
  },
  
  // 获取文章详情
  getDetail: (id) => {
    return request('/article/detail', {
      method: 'GET',
      data: { id }
    })
  },
  
  // 发布文章
  publish: (articleData) => {
    return request('/article/publish', {
      method: 'POST',
      data: articleData
    })
  },
  
  // 编辑文章
  edit: (articleData) => {
    return request('/article/edit', {
      method: 'PUT',
      data: articleData
    })
  },
  
  // 删除文章
  delete: (id) => {
    return request('/article/delete', {
      method: 'DELETE',
      data: { id }
    })
  },
  
  // 获取我发布的文章列表
  getMyPosts: (params = {}) => {
    const { page = 1, pageSize = 10 } = params
    return request('/article/myPosts', {
      method: 'GET',
      data: { page, pageSize }
    })
  }
}

// 搜索相关API
export const searchApi = {
  // 搜索文章
  searchArticle: (keyword, params = {}) => {
    const { page = 1, pageSize = 10 } = params
    return request('/search/article', {
      method: 'GET',
      data: { keyword, page, pageSize }
    })
  }
}

export default {
  userApi,
  articleApi,
  searchApi,
  getToken,
  setToken,
  removeToken
}
