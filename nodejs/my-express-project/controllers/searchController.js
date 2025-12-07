const articleModel = require('../models/article');

/**
 * 搜索文章
 */
async function searchArticle(req, res) {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        code: 400,
        message: '请提供搜索关键词',
        data: null
      });
    }

    const result = await articleModel.searchArticles(keyword, {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    res.json({
      code: 200,
      message: '搜索成功',
      data: result
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
  searchArticle
};

