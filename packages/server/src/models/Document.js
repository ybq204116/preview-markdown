const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    // 标题
    title: {
        type: String,
        required: [true, '文档标题不能为空'],
        trim: true,
        default: '新建文档'
    },

    // Markdown 内容
    content: {
        type: String,
        default: '' // 允许空内容
    },

    // 原始 LocalStorage ID (用于数据迁移)
    // 迁移完成后，主要使用 MongoDB 自动生成的 _id
    originalId: {
        type: String,
        index: true
    },

    // 所属用户
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    // 标签 (预留字段)
    tags: [{
        type: String,
        trim: true
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model('Document', DocumentSchema);
