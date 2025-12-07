const jwt = require('jsonwebtoken');

// JWT密钥，生产环境应该从环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * 认证中间件 - 验证Token
 */
const authenticateToken = (req, res, next) => {
  // 获取 Authorization 请求头
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  // 检查是否有 Authorization 头
  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: '请先登录',
      data: null
    });
  }

  // 解析 Bearer Token 格式: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      code: 401,
      message: 'Token格式错误，请使用 Bearer Token',
      data: null
    });
  }

  const token = parts[1];

  // 验证 Token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('❌ Token验证失败:', err.message);
      return res.status(401).json({
        code: 401,
        message: 'Token无效或已过期',
        data: null
      });
    }
    
    // 将用户信息附加到请求对象
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
    next();
  });
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};

