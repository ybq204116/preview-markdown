const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 获取 token (去掉 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 验证 token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // 获取用户信息 (排除密码)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: '未授权，用户不存在' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: '未授权，Token 无效' });
        }
    }

    if (!token) {
        res.status(401).json({ message: '未授权，无 Token' });
    }
};

module.exports = { protect };
