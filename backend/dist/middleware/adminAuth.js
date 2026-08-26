"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAuth = void 0;
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
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Unauthorized or inactive account' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    if (req.user.role !== 'SUPER_ADMIN') {
        res.status(403).json({ success: false, message: 'Forbidden: Super Admin access required' });
        return;
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
