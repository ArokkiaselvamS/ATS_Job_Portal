"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetMe = exports.adminLogout = exports.adminLogin = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const adminLogin = async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ success: false, message: 'Account is deactivated' });
            return;
        }
        if (user.isSuspended) {
            res.status(403).json({ success: false, message: 'Account is suspended' });
            return;
        }
        if (user.isBlocked) {
            res.status(403).json({ success: false, message: 'Account is blocked' });
            return;
        }
        if (user.role !== 'SUPER_ADMIN') {
            res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
            return;
        }
        const isValidPassword = await (0, password_1.verifyPassword)(data.password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        await prisma_1.default.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminLogin = adminLogin;
const adminLogout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
    res.json({ success: true, message: 'Admin logout successful' });
};
exports.adminLogout = adminLogout;
const adminGetMe = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                profileImage: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        if (user.role !== 'SUPER_ADMIN') {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetMe = adminGetMe;
