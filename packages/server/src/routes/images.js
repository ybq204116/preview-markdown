const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const { protect } = require('../middleware/auth');

// 上传图片 (需要登录)
// POST /api/images
router.post('/', protect, async (req, res) => {
    try {
        const { image, filename, documentId } = req.body;

        if (!image) {
            return res.status(400).json({ message: '请提供图片数据' });
        }

        // 解析 Base64 数据
        // 格式通常是: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: '无效的图片数据格式' });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const size = buffer.length;

        // 创建图片记录
        const newImage = await Image.create({
            data: base64Data, // 存储 Base64 字符串
            mimeType: mimeType,
            filename: filename || `image-${Date.now()}`,
            size: size,
            user: req.user._id,
            document: documentId
        });

        // 返回图片的访问 URL
        // 假设服务器地址为当前 host，前端可以直接使用相对路径 /api/images/:id
        res.status(201).json({
            url: `/api/images/${newImage._id}`,
            filename: newImage.filename
        });

    } catch (error) {
        console.error('图片上传失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取图片 (公开访问)
// GET /api/images/:id
router.get('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ message: '图片不存在' });
        }

        // 将 Base64 转换为 Buffer
        const imgBuffer = Buffer.from(image.data, 'base64');

        // 设置响应头
        res.writeHead(200, {
            'Content-Type': image.mimeType,
            'Content-Length': imgBuffer.length
        });

        // 发送图片数据
        res.end(imgBuffer);

    } catch (error) {
        console.error('获取图片失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;
