"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateToken = void 0;
const crypto_1 = require("../utils/crypto");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ message: 'Token nije pronađen' });
        return;
    }
    try {
        const decoded = (0, crypto_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch {
        res.status(403).json({ message: 'Token nije validan ili je istekao' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Nemate ovlašćenje za ovu akciju' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
