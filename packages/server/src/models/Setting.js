const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  // 关联用户
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // 每个用户只有一个设置文档
  },

  // 主题设置 (对应 localStorage 的 'theme')
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },

  // 当前选中的文档 ID
  currentDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },

  // 编辑器配置 (预留字段)
  editorConfig: {
    fontSize: { type: Number, default: 14 },
    showLineNumbers: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', SettingSchema);
