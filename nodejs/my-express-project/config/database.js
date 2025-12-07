const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealosbja.site',
  port: 33805,
  user: 'root',
  password: '8rbhrc5x',
  database: 'api',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接（增加超时兜底，避免阻塞）
const testDBConnection = async () => {
  try {
    // 设置5秒超时，避免连接挂起
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('数据库连接超时')), 5000))
    ]);
    console.log('✅ 数据库连接成功');
    connection.release(); // 释放连接
    return pool;
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
    // 连接失败不退出服务（仅警告），保证API服务能启动
    return pool; 
  }
};

// 异步执行测试，不阻塞模块导出
testDBConnection();

// 封装通用数据库操作方法（可选，方便业务调用）
pool.query = async (sql, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('数据库查询失败:', sql, err.message);
    throw err; // 抛出错误让业务层处理
  } finally {
    if (connection) connection.release();
  }
};

module.exports = pool;