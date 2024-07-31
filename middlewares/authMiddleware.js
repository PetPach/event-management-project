const jwtService = require('../services/jwtService');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwtService.verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }

    req.user = decoded.user;
    next();
};

module.exports = authMiddleware;
