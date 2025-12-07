// 全局错误捕获（核心！避免进程静默退出）
process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获异常:', err.stack || err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理Promise拒绝:', reason.stack || reason);
});

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 1. 先加载数据库（异步，不阻塞）
console.log('🔌 开始初始化数据库...');
const pool = require('./config/database'); // 引入数据库连接池
console.log('🔌 数据库模块加载完成（异步连接中）');

// 2. 路由加载（兜底缺失文件）
var indexRouter = require('./routes/index');
console.log('📄 根路由文件加载成功：', indexRouter);

var usersRouter = (() => {
  try { return require('./routes/users'); } catch (e) {
    console.warn('⚠️ 缺少routes/users.js，创建空路由兜底');
    const r = express.Router();
    r.all('*', (req, res) => res.status(404).json({ code: 404, msg: 'users路由未实现' }));
    return r;
  }
})();

var userRouter = (() => {
  try { return require('./routes/user'); } catch (e) {
    console.warn('⚠️ 缺少routes/user.js，创建空路由兜底');
    const r = express.Router();
    r.all('*', (req, res) => res.status(404).json({ code: 404, msg: 'user路由未实现' }));
    return r;
  }
})();

var articleRouter = (() => {
  try { 
    const router = require('./routes/article');
    console.log('✅ 文章路由加载成功');
    return router;
  } catch (e) {
    console.warn('⚠️ 缺少routes/article.js，创建空路由兜底', e.message);
    const r = express.Router();
    r.all('*', (req, res) => res.status(404).json({ code: 404, msg: 'article路由未实现' }));
    return r;
  }
})();

var searchRouter = (() => {
  try { return require('./routes/search'); } catch (e) {
    console.warn('⚠️ 缺少routes/search.js，创建空路由兜底');
    const r = express.Router();
    r.all('*', (req, res) => res.status(404).json({ code: 404, msg: 'search路由未实现' }));
    return r;
  }
})();

// 3. 初始化Express应用
var app = express();
console.log('🚀 Express应用初始化完成');

// 4. CORS跨域中间件 - 必须在最顶部，优先处理跨域请求
app.use((req, res, next) => {
  // 允许来自 localhost:5173 的跨域请求
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost:5173') || origin.includes('127.0.0.1:5173'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 5. 其他中间件配置
app.use(logger('dev'));

// 请求体解析前的日志中间件
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`📦 [请求体解析前] ${req.method} ${req.path}`);
    console.log(`📦 [请求体解析前] Content-Type: ${req.get('Content-Type')}`);
  }
  next();
});

// 请求体解析中间件 - 必须在路由之前
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求体解析后的日志中间件
app.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && req.path.includes('/api/')) {
    console.log(`📦 [请求体解析后] ${req.method} ${req.path}`);
    console.log(`📦 [请求体解析后] 请求体:`, JSON.stringify(req.body));
  }
  next();
});
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log('✅ 中间件加载完成');

// 6. 挂载路由（可通过req.pool访问数据库）
app.use((req, res, next) => {
  req.pool = pool; // 把数据库连接池挂载到req，方便路由使用
  next();
});

// API路由 - 添加调试日志
app.use('/api/user', (req, res, next) => {
  console.log(`📡 用户API: ${req.method} ${req.path}`);
  next();
}, userRouter);

app.use('/api/article', (req, res, next) => {
  console.log(`📡 文章API: ${req.method} ${req.path}`);
  next();
}, articleRouter);

app.use('/api/search', (req, res, next) => {
  console.log(`📡 搜索API: ${req.method} ${req.path}`);
  next();
}, searchRouter);

// 原有路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
console.log('✅ 所有路由挂载完成');

// 7. 404处理
app.use(function(req, res, next) {
  console.log(`⚠️ 404拦截：请求路径=${req.path}，API请求=${req.path.startsWith('/api/')}`);
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      code: 404,
      message: '接口不存在',
      data: null
    });
  }
  next(createError(404));
});

// 8. 错误处理
app.use(function(err, req, res, next) {
  console.error(`❌ 服务器错误：${err.status || 500}，消息=${err.message}`);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      code: err.status || 500,
      message: err.message || '服务器内部错误',
      data: null
    });
  }

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 9. 暴露端口和应用
app.set('port', process.env.PORT || 3000);
console.log(`📌 应用配置完成，监听端口=${app.get('port')}`);

module.exports = app;