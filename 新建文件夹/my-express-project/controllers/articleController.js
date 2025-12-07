const articleModel = require('../models/article');
const userModel = require('../models/user');

/**
 * 获取文章列表
 */
async function getArticleList(req, res) {
  try {
    const { page = 1, pageSize = 10, category = 'all' } = req.query;

    // 验证分类
    const validCategories = ['all', 'life', 'food', 'tech'];
    const filterCategory = validCategories.includes(category) ? category : 'all';

    console.log(`📄 获取文章列表: page=${page}, pageSize=${pageSize}, category=${filterCategory}`);

    const result = await articleModel.getList({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      category: filterCategory
    });

    console.log(`✅ 文章列表获取成功: 共${result.total}条，返回${result.list.length}条`);

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    });
  } catch (error) {
    console.error('❌ 获取文章列表异常:');
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器内部错误',
      data: null
    });
  }
}

/**
 * 获取文章详情
 */
async function getArticleDetail(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '请提供文章ID',
        data: null
      });
    }

    const article = await articleModel.findById(id);
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null
      });
    }

    // 增加浏览量
    await articleModel.incrementViewCount(id);

    res.json({
      code: 200,
      message: '获取成功',
      data: article
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
 * 发布文章
 */
async function publishArticle(req, res) {
  try {
    const { title, category, description, content } = req.body;
    const userId = req.user.userId;

    // 参数验证
    if (!title || !category || !description || !content) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整信息',
        data: null
      });
    }

    // 标题长度验证
    if (title.length < 1 || title.length > 50) {
      return res.status(400).json({
        code: 400,
        message: '标题长度应在1-50个字符之间',
        data: null
      });
    }

    // 描述长度验证
    if (description.length < 1 || description.length > 200) {
      return res.status(400).json({
        code: 400,
        message: '描述长度应在1-200个字符之间',
        data: null
      });
    }

    // 内容长度验证
    if (content.length < 1 || content.length > 2000) {
      return res.status(400).json({
        code: 400,
        message: '内容长度应在1-2000个字符之间',
        data: null
      });
    }

    // 分类验证
    const validCategories = ['life', 'food', 'tech'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        code: 400,
        message: '分类无效',
        data: null
      });
    }

    // 获取用户信息
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    // 创建文章
    const article = await articleModel.createArticle({
      title,
      category,
      description,
      content,
      author: user.username,
      authorId: userId
    });

    res.json({
      code: 200,
      message: '发布成功',
      data: {
        id: article.id,
        title: article.title,
        createTime: article.createTime
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
 * 编辑文章
 */
async function editArticle(req, res) {
  try {
    const { id, title, category, description, content } = req.body;
    const userId = req.user.userId;

    // 参数验证
    if (!id || !title || !category || !description || !content) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整信息',
        data: null
      });
    }

    // 查找文章
    const article = await articleModel.findById(id);
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null
      });
    }

    // 权限验证：只有作者可以编辑
    if (article.authorId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权限编辑此文章',
        data: null
      });
    }

    // 标题长度验证
    if (title.length < 1 || title.length > 50) {
      return res.status(400).json({
        code: 400,
        message: '标题长度应在1-50个字符之间',
        data: null
      });
    }

    // 描述长度验证
    if (description.length < 1 || description.length > 200) {
      return res.status(400).json({
        code: 400,
        message: '描述长度应在1-200个字符之间',
        data: null
      });
    }

    // 内容长度验证
    if (content.length < 1 || content.length > 2000) {
      return res.status(400).json({
        code: 400,
        message: '内容长度应在1-2000个字符之间',
        data: null
      });
    }

    // 分类验证
    const validCategories = ['life', 'food', 'tech'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        code: 400,
        message: '分类无效',
        data: null
      });
    }

    // 更新文章
    const updatedArticle = await articleModel.updateArticle(id, {
      title,
      category,
      description,
      content
    });

    res.json({
      code: 200,
      message: '保存成功',
      data: {
        id: updatedArticle.id,
        updateTime: updatedArticle.updateTime
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
 * 删除文章
 */
async function deleteArticle(req, res) {
  try {
    const { id } = req.query;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '请提供文章ID',
        data: null
      });
    }

    // 查找文章
    const article = await articleModel.findById(id);
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在',
        data: null
      });
    }

    // 权限验证：只有作者可以删除
    if (article.authorId !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权限删除此文章',
        data: null
      });
    }

    // 删除文章
    const success = await articleModel.deleteArticle(id);
    if (!success) {
      return res.status(500).json({
        code: 500,
        message: '删除失败',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '删除成功',
      data: null
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
 * 获取我发布的文章列表
 */
async function getMyPosts(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const userId = req.user.userId;

    const result = await articleModel.getByAuthorId(userId, {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    res.json({
      code: 200,
      message: '获取成功',
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
  getArticleList,
  getArticleDetail,
  publishArticle,
  editArticle,
  deleteArticle,
  getMyPosts
};

