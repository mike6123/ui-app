const pool = require('../config/database');

/**
 * 创建文章
 */
async function createArticle(articleData) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO articles (title, description, content, category, author_id, author_name, view_count, like_count, create_time, update_time) 
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, NOW(), NOW())`,
      [
        articleData.title,
        articleData.description,
        articleData.content,
        articleData.category,
        articleData.authorId,
        articleData.author
      ]
    );
    
    const [articles] = await connection.execute(
      `SELECT article_id, title, description, content, category, author_id, author_name, 
              view_count, like_count, create_time, update_time 
       FROM articles WHERE article_id = ?`,
      [result.insertId]
    );
    
    const article = articles[0];
    return {
      id: article.article_id,
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      author: article.author_name,
      authorId: article.author_id,
      createTime: article.create_time,
      updateTime: article.update_time,
      viewCount: article.view_count,
      likeCount: article.like_count
    };
  } finally {
    connection.release();
  }
}

/**
 * 根据ID查找文章
 */
async function findById(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT article_id, title, description, content, category, author_id, author_name, 
              view_count, like_count, create_time, update_time 
       FROM articles WHERE article_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const article = rows[0];
    return {
      id: article.article_id,
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      author: article.author_name,
      authorId: article.author_id,
      createTime: article.create_time,
      updateTime: article.update_time,
      viewCount: article.view_count,
      likeCount: article.like_count
    };
  } finally {
    connection.release();
  }
}

/**
 * 获取文章列表（支持分页和分类筛选）
 */
async function getList(options = {}) {
  const { page = 1, pageSize = 10, category = 'all' } = options;
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('📊 数据库连接获取成功，开始查询文章列表');
    
    // 检查表是否存在
    try {
      const [tables] = await connection.execute("SHOW TABLES LIKE 'articles'");
      if (tables.length === 0) {
        console.error('❌ 错误：articles 表不存在！');
        throw new Error('articles 表不存在，请先创建数据库表');
      }
      console.log('✅ articles 表存在');
    } catch (tableError) {
      console.error('❌ 检查表时出错:', tableError.message);
      throw tableError;
    }
    
    let countQuery = 'SELECT COUNT(*) as total FROM articles';
    let listQuery = `SELECT article_id as id, title, description, category, author_name as author, 
                            create_time as createTime, view_count as viewCount 
                     FROM articles`;
    const params = [];
    
    // 分类筛选
    if (category !== 'all') {
      const whereClause = ' WHERE category = ?';
      countQuery += whereClause;
      listQuery += whereClause;
      params.push(category);
    }
    
    console.log('📊 执行COUNT查询:', countQuery, '参数:', params);
    // 获取总数
    const [countResult] = await connection.execute(countQuery, params);
    const total = countResult[0].total;
    console.log('📊 文章总数:', total);
    
    // 分页参数
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit;
    
    // 分页查询 - MySQL 的 LIMIT 和 OFFSET 需要直接使用数字，不能使用参数绑定
    listQuery += ` ORDER BY create_time DESC LIMIT ${limit} OFFSET ${offset}`;
    console.log('📊 执行列表查询:', listQuery, '参数:', params);
    
    const [rows] = await connection.execute(listQuery, params);
    console.log('📊 查询成功，返回', rows.length, '条记录');
    
    return {
      list: rows,
      total: total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
  } catch (error) {
    console.error('❌ 获取文章列表失败:');
    console.error('错误消息:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误SQL状态:', error.sqlState);
    console.error('错误堆栈:', error.stack);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * 更新文章
 */
async function updateArticle(id, articleData) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `UPDATE articles SET title = ?, description = ?, content = ?, category = ?, update_time = NOW() 
       WHERE article_id = ?`,
      [
        articleData.title,
        articleData.description,
        articleData.content,
        articleData.category,
        id
      ]
    );
    
    const [rows] = await connection.execute(
      `SELECT article_id, title, description, content, category, author_id, author_name, 
              view_count, like_count, create_time, update_time 
       FROM articles WHERE article_id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const article = rows[0];
    return {
      id: article.article_id,
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      author: article.author_name,
      authorId: article.author_id,
      createTime: article.create_time,
      updateTime: article.update_time,
      viewCount: article.view_count,
      likeCount: article.like_count
    };
  } finally {
    connection.release();
  }
}

/**
 * 删除文章
 */
async function deleteArticle(id) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'DELETE FROM articles WHERE article_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * 获取用户发布的文章列表
 */
async function getByAuthorId(authorId, options = {}) {
  const { page = 1, pageSize = 10 } = options;
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // 获取总数
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM articles WHERE author_id = ?',
      [authorId]
    );
    const total = countResult[0].total;
    
    // 分页参数
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit;
    
    // 分页查询 - MySQL 的 LIMIT 和 OFFSET 需要直接使用数字
    const [rows] = await connection.execute(
      `SELECT article_id as id, title, description, category, create_time as createTime, view_count as viewCount 
       FROM articles 
       WHERE author_id = ? 
       ORDER BY create_time DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [authorId]
    );
    
    return {
      list: rows,
      total: total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
  } catch (error) {
    console.error('❌ 获取用户文章列表失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * 搜索文章
 */
async function searchArticles(keyword, options = {}) {
  const { page = 1, pageSize = 10 } = options;
  let connection;
  
  try {
    connection = await pool.getConnection();
    const searchPattern = `%${keyword}%`;
    
    // 获取总数
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM articles 
       WHERE title LIKE ? OR description LIKE ? OR content LIKE ?`,
      [searchPattern, searchPattern, searchPattern]
    );
    const total = countResult[0].total;
    
    // 分页参数
    const limit = parseInt(pageSize) || 10;
    const offset = (parseInt(page) - 1) * limit;
    
    // 分页查询 - MySQL 的 LIMIT 和 OFFSET 需要直接使用数字
    const [rows] = await connection.execute(
      `SELECT article_id as id, title, description, category, author_name as author, create_time as createTime 
       FROM articles 
       WHERE title LIKE ? OR description LIKE ? OR content LIKE ? 
       ORDER BY create_time DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [searchPattern, searchPattern, searchPattern]
    );
    
    return {
      list: rows,
      total: total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
  } catch (error) {
    console.error('❌ 搜索文章失败:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * 增加文章浏览量
 */
async function incrementViewCount(id) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'UPDATE articles SET view_count = view_count + 1 WHERE article_id = ?',
      [id]
    );
  } finally {
    connection.release();
  }
}

module.exports = {
  createArticle,
  findById,
  getList,
  updateArticle,
  deleteArticle,
  getByAuthorId,
  searchArticles,
  incrementViewCount
};
