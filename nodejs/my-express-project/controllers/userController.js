const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const userModel = require('../models/user');

/**
 * 用户注册
 */
async function register(req, res) {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '请填写用户名和密码',
        data: null
      });
    }

    // 用户名长度验证
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        code: 400,
        message: '用户名长度应在3-20个字符之间',
        data: null
      });
    }

    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '密码至少需要6个字符',
        data: null
      });
    }

    // 检查用户名是否已存在
    const exists = await userModel.usernameExists(username);
    if (exists) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
        data: null
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await userModel.createUser(username, hashedPassword);

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        userId: user.userId,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

/**
 * 用户登录
 */
async function login(req, res) {
  try {
    console.log('🔐 登录请求到达，请求体:', JSON.stringify(req.body));
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      console.log('❌ 登录失败：缺少用户名或密码');
      return res.status(400).json({
        code: 400,
        message: '请填写用户名和密码',
        data: null
      });
    }

    console.log(`🔍 尝试登录用户: ${username}`);

    // 查找用户
    const user = await userModel.findByUsername(username);
    if (!user) {
      console.log(`❌ 登录失败：用户不存在 - ${username}`);
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    console.log(`✅ 找到用户: ${user.username}, ID: ${user.userId}`);

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`❌ 登录失败：密码错误 - ${username}`);
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    console.log(`✅ 密码验证成功 - ${username}`);

    // 生成Token（有效期7天）
    const token = jwt.sign(
      { userId: user.userId, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ 登录成功：${username}, Token已生成`);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          userId: user.userId,
          username: user.username
        }
      }
    });
  } catch (error) {
    console.error('❌ 登录异常:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

/**
 * 退出登录
 */
function logout(req, res) {
  // 由于使用JWT，服务端无需特殊处理，客户端删除token即可
  res.json({
    code: 200,
    message: '退出成功',
    data: null
  });
}

/**
 * 获取用户信息
 */
async function getUserInfo(req, res) {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        userId: user.userId,
        username: user.username,
        avatar: user.avatar || 'https://example.com/avatar.jpg',
        createTime: user.createTime
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getUserInfo
};

