"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../utils/prisma"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phone: zod_1.z.string().optional(),
});
const register = async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email already exists' });
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        const user = await prisma_1.default.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                passwordHash: hashedPassword,
                phone: data.phone,
                role: 'JOB_SEEKER',
                profile: {
                    create: {},
                },
            },
        });
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            success: true,
            message: 'Registration successful',
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
exports.register = register;
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const login = async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const isValidPassword = await (0, password_1.verifyPassword)(data.password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            message: 'Login successful',
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
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.json({ success: true, message: 'Logout successful' });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
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
            },
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
