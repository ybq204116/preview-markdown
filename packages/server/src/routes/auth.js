const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// 生成 Access Token (短效, 15分钟)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '15m'
    });
};

// 生成 Refresh Token (长效, 7天)
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret123', {
        expiresIn: '7d'
    });
};

// @desc    注册用户
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { phoneNumber, password, username } = req.body;

        if ((!phoneNumber && !username) || !password) {
            return res.status(400).json({ message: '请填写手机号/用户名和密码' });
        }

        // 构造查询条件
        const query = [];
        if (phoneNumber) query.push({ phoneNumber });
        if (username) query.push({ username });

        // 检查用户是否已存在
        const userExists = await User.findOne({
            $or: query
        });

        if (userExists) {
            if (phoneNumber && userExists.phoneNumber === phoneNumber) {
                return res.status(400).json({ message: '该手机号已注册' });
            }
            if (username && userExists.username === username) {
                return res.status(400).json({ message: '该用户名已存在' });
            }
        }

        // 创建用户
        const user = await User.create({
            phoneNumber: phoneNumber || username, // 如果没有手机号，暂时用用户名填充（根据 Schema 要求调整）
            password,
            username
        });

        if (user) {
            // 生成双 token
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // 保存 refreshToken 到数据库
            user.refreshToken = refreshToken;
            await user.save();

            res.status(201).json({
                _id: user._id,
                phoneNumber: user.phoneNumber,
                username: user.username,
                token: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(400).json({ message: '无效的用户数据' });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: '服务器错误' });
    }
});

// @desc    登录用户
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { identifier, password, phoneNumber } = req.body;

        // 兼容旧的 phoneNumber 参数
        const loginIdentifier = identifier || phoneNumber;

        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: '请输入账号和密码' });
        }

        // 检查用户是否存在 (支持手机号或用户名)
        const user = await User.findOne({
            $or: [
                { phoneNumber: loginIdentifier },
                { username: loginIdentifier }
            ]
        });

        if (user && (await user.matchPassword(password))) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // 更新 refreshToken
            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                _id: user._id,
                phoneNumber: user.phoneNumber,
                username: user.username,
                token: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(401).json({ message: '账号或密码错误' });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// @desc    获取当前用户信息
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// @desc    刷新 Token
// @route   POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: '未提供 Refresh Token' });
        }

        // 验证 Refresh Token
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');

            // 查找用户并比对数据库中的 refreshToken
            const user = await User.findById(decoded.id);

            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: '无效的 Refresh Token' });
            }

            // 生成新的 Access Token
            const newAccessToken = generateAccessToken(user._id);

            res.json({ token: newAccessToken });

        } catch (err) {
            console.error('Refresh Token Error:', err);
            return res.status(403).json({ message: 'Refresh Token 已过期或无效' });
        }

    } catch (error) {
        console.error('Refresh Error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// @desc    退出登录
// @route   POST /api/auth/logout
router.post('/logout', async (req, res) => {
    try {
        const { userId } = req.body;
        if (userId) {
            await User.findByIdAndUpdate(userId, { refreshToken: null });
        }
        res.json({ message: '退出成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;
