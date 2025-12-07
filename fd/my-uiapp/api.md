# Vue论坛 API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **API 前缀**: `/api`
- **Content-Type**: `application/json`
- **字符编码**: `UTF-8`

## 数据库配置

### 连接信息
- **数据库类型**: MySQL
- **数据库名称**: `api`
- **主机地址**: `localhost` (默认)
- **端口**: `3306` (默认)
- **用户名**: `root`
- **密码**: `123456`

### 连接字符串示例
```
mysql://root:123456@localhost:3306/ap
```

---

## 数据库表结构

### 1. 用户表 (users)

| 字段名 | 类型 | 长度 | 是否主键 | 是否为空 | 说明 |
|--------|------|------|----------|----------|------|
| user_id | INT | - | 是 | 否 | 用户ID，自增 |
| username | VARCHAR | 50 | 否 | 否 | 用户名，唯一索引 |
| password | VARCHAR | 255 | 否 | 否 | 加密后的密码 |
| avatar | VARCHAR | 255 | 否 | 是 | 头像URL |
| create_time | DATETIME | - | 否 | 否 | 创建时间 |
| update_time | DATETIME | - | 否 | 是 | 更新时间 |

**SQL 建表语句**:
```sql
CREATE TABLE `users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. 文章表 (articles)

| 字段名 | 类型 | 长度 | 是否主键 | 是否为空 | 说明 |
|--------|------|------|----------|----------|------|
| article_id | INT | - | 是 | 否 | 文章ID，自增 |
| title | VARCHAR | 100 | 否 | 否 | 文章标题 |
| description | VARCHAR | 500 | 否 | 否 | 文章描述 |
| content | TEXT | - | 否 | 否 | 文章内容 |
| category | VARCHAR | 20 | 否 | 否 | 分类：life/food/tech |
| author_id | INT | - | 否 | 否 | 作者ID，外键关联users表 |
| author_name | VARCHAR | 50 | 否 | 否 | 作者名称（冗余字段，便于查询） |
| view_count | INT | - | 否 | 否 | 浏览次数，默认0 |
| like_count | INT | - | 否 | 否 | 点赞次数，默认0 |
| create_time | DATETIME | - | 否 | 否 | 创建时间 |
| update_time | DATETIME | - | 否 | 是 | 更新时间 |

**SQL 建表语句**:
```sql
CREATE TABLE `articles` (
  `article_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(20) NOT NULL,
  `author_id` INT NOT NULL,
  `author_name` VARCHAR(50) NOT NULL,
  `view_count` INT NOT NULL DEFAULT 0,
  `like_count` INT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`article_id`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_category` (`category`),
  KEY `idx_create_time` (`create_time`),
  FULLTEXT KEY `idx_search` (`title`, `description`, `content`),
  CONSTRAINT `fk_articles_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 认证方式

大部分接口需要在请求头中携带 Token：

```
Authorization: Bearer {token}
```

Token 通过登录接口获取，有效期 7 天。

---

## 1. 用户相关接口

### 1.1 用户注册

**接口地址**: `POST /api/user/register`

**完整URL**: `http://localhost:3000/api/user/register`

**请求参数**:

```json
{
  "username": "string",    // 必填，用户名，3-20个字符
  "password": "string"      // 必填，密码，至少6个字符
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "testuser"
  }
}
```

**错误响应**:

```json
{
  "code": 400,
  "message": "用户名已存在"
}
```

---

### 1.2 用户登录

**接口地址**: `POST /api/user/login`

**完整URL**: `http://localhost:3000/api/user/login`

**请求参数**:

```json
{
  "username": "string",    // 必填，用户名
  "password": "string"      // 必填，密码
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "userId": 1,
      "username": "testuser"
    }
  }
}
```

**错误响应**:

```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

---

### 1.3 退出登录

**接口地址**: `POST /api/user/logout`

**完整URL**: `http://localhost:3000/api/user/logout`

**请求头**: 需要携带 Token

```
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "退出成功"
}
```

---

### 1.4 获取用户信息

**接口地址**: `GET /api/user/info`

**完整URL**: `http://localhost:3000/api/user/info`

**请求头**: 需要携带 Token

```
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": 1,
    "username": "testuser",
    "avatar": "https://example.com/avatar.jpg",
    "createTime": "2024-01-01 10:00:00"
  }
}
```

---

## 2. 文章相关接口

### 2.1 获取文章列表

**接口地址**: `GET /api/article/list`

**完整URL**: `http://localhost:3000/api/article/list`

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| category | string | 否 | 分类筛选：all(全部)、life(生活)、food(美食)、tech(技术) |

**请求示例**: `GET http://localhost:3000/api/article/list?page=1&pageSize=10&category=life`

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "周末citywalk保姆级攻略",
        "description": "解锁城市小众角落,附路线规划",
        "category": "life",
        "author": "林晚星",
        "createTime": "2024-01-01 10:00:00",
        "viewCount": 100
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2.2 获取文章详情

**接口地址**: `GET /api/article/detail`

**完整URL**: `http://localhost:3000/api/article/detail`

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 文章ID |

**请求示例**: `GET http://localhost:3000/api/article/detail?id=1`

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "title": "周末citywalk保姆级攻略",
    "description": "解锁城市小众角落,附路线规划",
    "content": "周末citywalk是一种轻松愉快的城市探索方式...",
    "category": "life",
    "author": "林晚星",
    "authorId": 1,
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00",
    "viewCount": 100,
    "likeCount": 20
  }
}
```

**错误响应**:

```json
{
  "code": 404,
  "message": "文章不存在"
}
```

---

### 2.3 发布文章

**接口地址**: `POST /api/article/publish`

**完整URL**: `http://localhost:3000/api/article/publish`

**请求头**: 需要携带 Token

```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:

```json
{
  "title": "string",        // 必填，标题，1-50个字符
  "category": "string",     // 必填，分类：life/food/tech
  "description": "string",  // 必填，描述，1-200个字符
  "content": "string"       // 必填，内容，1-2000个字符
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 1,
    "title": "周末citywalk保姆级攻略",
    "createTime": "2024-01-01 10:00:00"
  }
}
```

**错误响应**:

```json
{
  "code": 401,
  "message": "请先登录"
}
```

```json
{
  "code": 400,
  "message": "请填写完整信息"
}
```

---

### 2.4 编辑文章

**接口地址**: `PUT /api/article/edit`

**完整URL**: `http://localhost:3000/api/article/edit`

**请求头**: 需要携带 Token

```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:

```json
{
  "id": 1,                  // 必填，文章ID
  "title": "string",        // 必填，标题
  "category": "string",     // 必填，分类
  "description": "string",  // 必填，描述
  "content": "string"       // 必填，内容
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "保存成功",
  "data": {
    "id": 1,
    "updateTime": "2024-01-01 11:00:00"
  }
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无权限编辑此文章"
}
```

```json
{
  "code": 404,
  "message": "文章不存在"
}
```

---

### 2.5 删除文章

**接口地址**: `DELETE /api/article/delete`

**完整URL**: `http://localhost:3000/api/article/delete`

**请求头**: 需要携带 Token

```
Authorization: Bearer {token}
```

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 文章ID |

**请求示例**: `DELETE http://localhost:3000/api/article/delete?id=1`

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功"
}
```

**错误响应**:

```json
{
  "code": 403,
  "message": "无权限删除此文章"
}
```

---

### 2.6 获取我发布的文章列表

**接口地址**: `GET /api/article/myPosts`

**完整URL**: `http://localhost:3000/api/article/myPosts`

**请求头**: 需要携带 Token

```
Authorization: Bearer {token}
```

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

**请求示例**: `GET http://localhost:3000/api/article/myPosts?page=1&pageSize=10`

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "周末citywalk保姆级攻略",
        "description": "解锁城市小众角落,附路线规划",
        "category": "life",
        "createTime": "2024-01-01 10:00:00",
        "viewCount": 100
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 3. 搜索相关接口

### 3.1 搜索文章

**接口地址**: `GET /api/search/article`

**完整URL**: `http://localhost:3000/api/search/article`

**请求参数** (Query):

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

**请求示例**: `GET http://localhost:3000/api/search/article?keyword=citywalk&page=1&pageSize=10`

**响应示例**:

```json
{
  "code": 200,
  "message": "搜索成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "周末citywalk保姆级攻略",
        "description": "解锁城市小众角落,附路线规划",
        "category": "life",
        "author": "林晚星",
        "createTime": "2024-01-01 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 4. 通用响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

---

## 5. 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或Token无效 |
| 403 | 无权限操作 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 6. 数据模型

### 用户模型 (User)

```typescript
{
  userId: number;        // 用户ID
  username: string;      // 用户名
  avatar?: string;        // 头像URL
  createTime: string;    // 创建时间
}
```

### 文章模型 (Article)

```typescript
{
  id: number;            // 文章ID
  title: string;         // 标题
  description: string;    // 描述
  content: string;       // 内容
  category: 'life' | 'food' | 'tech';  // 分类
  author: string;        // 作者名称
  authorId: number;      // 作者ID
  createTime: string;    // 创建时间
  updateTime: string;    // 更新时间
  viewCount: number;     // 浏览次数
  likeCount: number;     // 点赞次数
}
```

---

## 7. 前端接口调用示例

### JavaScript/TypeScript 示例

```javascript
// 配置基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 获取Token（从localStorage或sessionStorage）
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// 设置Token
function setToken(token) {
  localStorage.setItem('token', token);
}

// 通用请求函数
async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }
  
  return data.data;
}

// 用户注册
async function register(username, password) {
  return await request('/user/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

// 用户登录
async function login(username, password) {
  const data = await request('/user/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
}

// 退出登录
async function logout() {
  await request('/user/logout', {
    method: 'POST'
  });
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

// 获取用户信息
async function getUserInfo() {
  return await request('/user/info');
}

// 获取文章列表
async function getArticleList(params = {}) {
  const { page = 1, pageSize = 10, category = 'all' } = params;
  const query = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    category
  });
  return await request(`/article/list?${query}`);
}

// 获取文章详情
async function getArticleDetail(id) {
  return await request(`/article/detail?id=${id}`);
}

// 发布文章
async function publishArticle(articleData) {
  return await request('/article/publish', {
    method: 'POST',
    body: JSON.stringify(articleData)
  });
}

// 编辑文章
async function editArticle(articleData) {
  return await request('/article/edit', {
    method: 'PUT',
    body: JSON.stringify(articleData)
  });
}

// 删除文章
async function deleteArticle(id) {
  return await request(`/article/delete?id=${id}`, {
    method: 'DELETE'
  });
}

// 获取我发布的文章列表
async function getMyPosts(params = {}) {
  const { page = 1, pageSize = 10 } = params;
  const query = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  return await request(`/article/myPosts?${query}`);
}

// 搜索文章
async function searchArticle(keyword, params = {}) {
  const { page = 1, pageSize = 10 } = params;
  const query = new URLSearchParams({
    keyword,
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  return await request(`/search/article?${query}`);
}

// 使用示例
async function example() {
  try {
    // 注册
    await register('testuser', 'password123');
    
    // 登录
    const loginData = await login('testuser', 'password123');
    console.log('登录成功:', loginData);
    
    // 获取用户信息
    const userInfo = await getUserInfo();
    console.log('用户信息:', userInfo);
    
    // 获取文章列表
    const articleList = await getArticleList({ page: 1, pageSize: 10, category: 'life' });
    console.log('文章列表:', articleList);
    
    // 发布文章
    const newArticle = await publishArticle({
      title: '我的第一篇文章',
      category: 'life',
      description: '这是文章描述',
      content: '这是文章内容...'
    });
    console.log('发布成功:', newArticle);
    
    // 搜索文章
    const searchResults = await searchArticle('citywalk');
    console.log('搜索结果:', searchResults);
  } catch (error) {
    console.error('错误:', error.message);
  }
}
```

### Axios 示例

```javascript
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加Token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  response => {
    const { code, message, data } = response.data;
    if (code === 200) {
      return data;
    } else {
      return Promise.reject(new Error(message || '请求失败'));
    }
  },
  error => {
    if (error.response) {
      const { code, message } = error.response.data;
      return Promise.reject(new Error(message || '请求失败'));
    }
    return Promise.reject(error);
  }
);

// 导出API方法
export const userApi = {
  register: (username, password) => api.post('/user/register', { username, password }),
  login: (username, password) => api.post('/user/login', { username, password }),
  logout: () => api.post('/user/logout'),
  getInfo: () => api.get('/user/info')
};

export const articleApi = {
  getList: (params) => api.get('/article/list', { params }),
  getDetail: (id) => api.get('/article/detail', { params: { id } }),
  publish: (data) => api.post('/article/publish', data),
  edit: (data) => api.put('/article/edit', data),
  delete: (id) => api.delete('/article/delete', { params: { id } }),
  getMyPosts: (params) => api.get('/article/myPosts', { params })
};

export const searchApi = {
  searchArticle: (keyword, params) => api.get('/search/article', { 
    params: { keyword, ...params } 
  })
};

// 使用示例
async function example() {
  try {
    // 登录
    const loginData = await userApi.login('testuser', 'password123');
    if (loginData.token) {
      localStorage.setItem('token', loginData.token);
    }
    
    // 获取文章列表
    const articleList = await articleApi.getList({ 
      page: 1, 
      pageSize: 10, 
      category: 'life' 
    });
    console.log('文章列表:', articleList);
  } catch (error) {
    console.error('错误:', error.message);
  }
}
```

---

## 8. 注意事项

1. **Token 有效期**: Token 有效期为 7 天，过期后需要重新登录
2. **请求频率**: 建议对接口进行限流，防止恶意请求
3. **数据验证**: 所有必填参数都需要进行验证，返回明确的错误信息
4. **权限控制**: 编辑和删除操作需要验证是否为文章作者
5. **分页**: 列表接口建议使用分页，避免一次性返回过多数据
6. **错误处理**: 所有接口都应该返回统一的错误格式
7. **跨域问题**: 前端开发时可能需要配置CORS，后端需要允许跨域请求
8. **数据库连接**: 确保MySQL服务已启动，数据库`ap`已创建，表结构已初始化

---

## 9. 后端启动说明

### 启动步骤

1. **安装依赖**:
   ```bash
   cd my-express-project
   npm install
   ```

2. **配置数据库**:
   - 确保MySQL服务已启动
   - 创建数据库: `CREATE DATABASE ap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   - 执行建表SQL（见上方数据库表结构部分）

3. **启动服务器**:
   ```bash
   npm start
   ```
   或
   ```bash
   node bin/www
   ```

4. **服务器地址**:
   - 默认运行在: `http://localhost:3000`
   - 可通过环境变量 `PORT` 修改端口

---

## 10. 更新日志

- **v1.0.0** (2024-01-01): 初始版本，包含用户、文章基础功能

