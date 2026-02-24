const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加 JSON 请求体限制以支持 Base64 图片上传
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 路由
app.use('/api/documents', require('./src/routes/documents'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/images', require('./src/routes/images'));
app.use('/api/ai', require('./src/routes/ai'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
