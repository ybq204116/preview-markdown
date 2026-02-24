const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');

// @desc    获取用户设置
// @route   GET /api/settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let setting = await Setting.findOne({ user: req.user.id });

    if (!setting) {
      // 如果没有配置，初始化一个默认配置并关联用户
      setting = await Setting.create({ user: req.user.id });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    更新用户设置
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const { theme, currentDocumentId } = req.body;

    let setting = await Setting.findOne({ user: req.user.id });
    if (!setting) {
      setting = new Setting({ user: req.user.id });
    }

    if (theme) setting.theme = theme;
    if (currentDocumentId) setting.currentDocumentId = currentDocumentId;

    const updatedSetting = await setting.save();
    res.json(updatedSetting);
  } catch (error) {
    res.status(400).json({ message: '更新失败', error: error.message });
  }
});

module.exports = router;
