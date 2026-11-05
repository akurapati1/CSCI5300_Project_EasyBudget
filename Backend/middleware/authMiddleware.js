const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (ex) {
        // 401 (not 400): the credentials are missing/invalid, so clients know to re-authenticate.
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
