const pool = require('../config/database');

/**
 * 创建用户
 */
async function createUser(username, password) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, create_time) VALUES (?, ?, NOW())',
      [username, password]
    );
    
    const [users] = await connection.execute(
      'SELECT user_id, username, avatar, create_time FROM users WHERE user_id = ?',
      [result.insertId]
    );
    
    return {
      userId: users[0].user_id,
      username: users[0].username,
      password: password,
      avatar: users[0].avatar,
      createTime: users[0].create_time
    };
  } finally {
    connection.release();
  }
}

/**
 * 根据用户名查找用户
 */
async function findByUsername(username) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT user_id, username, password, avatar, create_time, update_time FROM users WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      console.log(`📭 数据库中未找到用户: ${username}`);
      return null;
    }
    
    console.log(`✅ 数据库中找到用户: ${username}, ID: ${rows[0].user_id}`);
    return {
      userId: rows[0].user_id,
      username: rows[0].username,
      password: rows[0].password,
      avatar: rows[0].avatar,
      createTime: rows[0].create_time,
      updateTime: rows[0].update_time
    };
  } catch (error) {
    console.error(`❌ 查询用户失败 (${username}):`, error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * 根据ID查找用户
 */
async function findById(userId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT user_id, username, password, avatar, create_time, update_time FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return {
      userId: rows[0].user_id,
      username: rows[0].username,
      password: rows[0].password,
      avatar: rows[0].avatar,
      createTime: rows[0].create_time,
      updateTime: rows[0].update_time
    };
  } finally {
    connection.release();
  }
}

/**
 * 检查用户名是否存在
 */
async function usernameExists(username) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      [username]
    );
    
    return rows[0].count > 0;
  } finally {
    connection.release();
  }
}

module.exports = {
  createUser,
  findByUsername,
  findById,
  usernameExists
};
