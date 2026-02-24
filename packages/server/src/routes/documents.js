const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Image = require('../models/Image');
const { protect } = require('../middleware/auth');

// @desc    获取当前用户的所有文档
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    获取单个文档
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: '文档未找到' });
    }

    // 检查文档所有权
    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: '无权访问此文档' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    创建文档
// @route   POST /api/documents
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, originalId } = req.body;
    const document = new Document({
      user: req.user._id,
      title,
      content,
      originalId
    });
    const createdDocument = await document.save();
    res.status(201).json(createdDocument);
  } catch (error) {
    res.status(400).json({ message: '创建失败', error: error.message });
  }
});

// @desc    更新文档
// @route   PUT /api/documents/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: '文档未找到' });
    }

    // 检查文档所有权
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权修改此文档' });
    }

    document.title = title || document.title;

    // 如果内容更新了，处理图片清理
    if (content !== undefined) {
      document.content = content;

      // 找出内容中保留的图片 ID
      const keptImageIds = [];
      const regex = /\/api\/images\/([a-f0-9]{24})/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        keptImageIds.push(match[1]);
      }

      // 删除该文档下，且不在保留列表中的图片
      // 注意：如果有其他文档引用了同一张图片（虽然不推荐），这里也会删除
      // 但因为我们设计是图片属于特定文档，所以这是预期的行为
      // 增加安全缓冲：只删除 1 分钟前创建的图片，避免误删刚刚上传但尚未保存到内容中的图片
      const safetyTime = new Date(Date.now() - 60 * 1000);

      try {
        await Image.deleteMany({
          document: req.params.id,
          _id: { $nin: keptImageIds },
          createdAt: { $lt: safetyTime }
        });
      } catch (err) {
        console.error('清理图片失败:', err);
        // 不阻断文档保存
      }
    }

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error) {
    res.status(400).json({ message: '更新失败', error: error.message });
  }
});

// @desc    删除文档 (物理删除)
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: '文档未找到' });
    }

    // 检查文档所有权
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权删除此文档' });
    }

    // 删除关联的图片
    try {
      await Image.deleteMany({ document: req.params.id });
    } catch (err) {
      console.error('删除关联图片失败:', err);
      // 不阻断文档删除
    }

    await document.deleteOne(); // 使用 deleteOne() 进行物理删除

    res.json({ message: '文档已删除' });
  } catch (error) {
    console.error('删除文档失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
