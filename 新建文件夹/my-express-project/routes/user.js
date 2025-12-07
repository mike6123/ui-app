const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// 用户注册
router.post('/register', userController.register);

// 用户登录（无需认证）
router.post('/login', userController.login);

// 退出登录（需要认证）
router.post('/logout', authenticateToken, userController.logout);

// 获取用户信息（需要认证）
router.get('/info', authenticateToken, userController.getUserInfo);

module.exports = router;

