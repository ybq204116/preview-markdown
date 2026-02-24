const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    data: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // 允许匿名上传，或者后续添加认证
    },
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Image', ImageSchema);
