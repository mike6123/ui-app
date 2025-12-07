const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticateToken } = require('../middleware/auth');

// 获取文章列表（无需认证）
router.get('/list', articleController.getArticleList);

// 获取文章详情（无需认证）
router.get('/detail', articleController.getArticleDetail);

// 发布文章（需要认证）
router.post('/publish', authenticateToken, articleController.publishArticle);

// 编辑文章（需要认证）
router.put('/edit', authenticateToken, articleController.editArticle);

// 删除文章（需要认证）
router.delete('/delete', authenticateToken, articleController.deleteArticle);

// 获取我发布的文章列表（需要认证）
router.get('/myPosts', authenticateToken, articleController.getMyPosts);

module.exports = router;

