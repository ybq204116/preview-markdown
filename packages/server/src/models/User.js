const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, '请输入手机号'],
        unique: true,
        trim: true,
        match: [/^1[3-9]\d{9}$/, '请输入有效的手机号']
    },
    username: {
        type: String,
        required: [true, '请输入用户名'],
        trim: true,
        unique: true,
        maxlength: [20, '用户名不能超过20个字符']
    },
    password: {
        type: String,
        required: [true, '请输入密码'],
        minlength: [6, '密码至少6位']
    },
    refreshToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 保存前加密密码
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 验证密码
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
