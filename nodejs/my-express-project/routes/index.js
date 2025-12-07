var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // 返回API信息页面
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vue论坛 API 服务</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          border-bottom: 3px solid #4CAF50;
          padding-bottom: 10px;
        }
        .api-section {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #4CAF50;
        }
        .endpoint {
          font-family: 'Courier New', monospace;
          background: #e8e8e8;
          padding: 5px 10px;
          border-radius: 4px;
          margin: 5px 0;
        }
        .method {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
          margin-right: 8px;
        }
        .get { background: #4CAF50; color: white; }
        .post { background: #2196F3; color: white; }
        .put { background: #FF9800; color: white; }
        .delete { background: #f44336; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Vue论坛 API 服务</h1>
        <p>后端服务运行正常！</p>
        
        <div class="api-section">
          <h2>用户相关接口</h2>
          <div class="endpoint"><span class="method post">POST</span>/api/user/register - 用户注册</div>
          <div class="endpoint"><span class="method post">POST</span>/api/user/login - 用户登录</div>
          <div class="endpoint"><span class="method post">POST</span>/api/user/logout - 退出登录</div>
          <div class="endpoint"><span class="method get">GET</span>/api/user/info - 获取用户信息</div>
        </div>
        
        <div class="api-section">
          <h2>文章相关接口</h2>
          <div class="endpoint"><span class="method get">GET</span>/api/article/list - 获取文章列表</div>
          <div class="endpoint"><span class="method get">GET</span>/api/article/detail - 获取文章详情</div>
          <div class="endpoint"><span class="method post">POST</span>/api/article/publish - 发布文章</div>
          <div class="endpoint"><span class="method put">PUT</span>/api/article/edit - 编辑文章</div>
          <div class="endpoint"><span class="method delete">DELETE</span>/api/article/delete - 删除文章</div>
          <div class="endpoint"><span class="method get">GET</span>/api/article/myPosts - 获取我的文章</div>
        </div>
        
        <div class="api-section">
          <h2>搜索相关接口</h2>
          <div class="endpoint"><span class="method get">GET</span>/api/search/article - 搜索文章</div>
        </div>
        
        <p style="margin-top: 30px; color: #666;">
          <strong>Base URL:</strong> http://localhost:3000<br>
          详细API文档请查看项目中的 api.md 文件
        </p>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
