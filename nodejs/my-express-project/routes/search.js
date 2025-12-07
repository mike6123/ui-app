const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// 搜索文章（无需认证）
router.get('/article', searchController.searchArticle);

module.exports = router;

