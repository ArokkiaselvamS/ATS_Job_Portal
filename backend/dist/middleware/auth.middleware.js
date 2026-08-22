"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../utils/prisma"));
const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        // Check if user still exists and is active
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Unauthorized or inactive account' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
