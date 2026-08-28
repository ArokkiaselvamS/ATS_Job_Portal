"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCompany = exports.registerCompany = void 0;
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const password_1 = require("../../utils/password");
const audit_service_1 = require("../../services/audit.service");
const notification_service_1 = require("../../services/notification.service");
const registerCompanySchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2, 'Company name must be at least 2 characters'),
    officialEmail: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    industry: zod_1.z.string().min(1, 'Industry is required'),
    companySize: zod_1.z.string().min(1, 'Company size is required'),
    foundedYear: zod_1.z.string().optional().refine(val => {
        if (!val)
            return true;
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year >= 1800 && year <= currentYear;
    }, 'Please enter a valid year'),
    website: zod_1.z.string().url('Please enter a valid URL').optional().or(zod_1.z.literal('')),
    description: zod_1.z.string().min(50, 'Description must be at least 50 characters'),
    country: zod_1.z.string().min(1, 'Country is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
    contactName: zod_1.z.string().min(1, 'Contact person name is required'),
    designation: zod_1.z.string().optional(),
    contactPhone: zod_1.z.string().min(1, 'Contact phone is required')
        .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Please enter a valid phone number'),
    contactEmail: zod_1.z.string().email('Please enter a valid email address'),
});
const registerCompany = async (req, res, next) => {
    try {
        const bodyData = { ...req.body };
        if (bodyData.foundedYear === '')
            bodyData.foundedYear = undefined;
        if (bodyData.website === '')
            bodyData.website = undefined;
        if (bodyData.designation === '')
            bodyData.designation = undefined;
        const data = registerCompanySchema.parse(bodyData);
        const existingCompany = await prisma_1.default.company.findFirst({
            where: { officialEmail: data.officialEmail },
        });
        if (existingCompany) {
            res.status(400).json({ success: false, message: 'A company with this email already exists' });
            return;
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.officialEmail },
        });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'A user with this email already exists' });
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        let logoUrl;
        if (req.file) {
            const uploadsDir = 'uploads/companies';
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const fileName = `${Date.now()}-${req.file.originalname}`;
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);
            logoUrl = `/uploads/companies/${fileName}`;
        }
        const company = await prisma_1.default.company.create({
            data: {
                name: data.companyName,
                officialEmail: data.officialEmail,
                passwordHash: hashedPassword,
                logo: logoUrl,
                industry: data.industry,
                companySize: data.companySize,
                foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null,
                website: data.website || null,
                description: data.description,
                country: data.country,
                state: data.state,
                city: data.city,
                address: data.address,
                contactName: data.contactName,
                designation: data.designation || null,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail,
                verificationStatus: 'PENDING',
            },
        });
        const tempReferralCode = 'COMP' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 6).toUpperCase();
        const user = await prisma_1.default.user.create({
            data: {
                firstName: data.contactName.split(' ')[0] || 'Admin',
                lastName: data.contactName.split(' ').slice(1).join(' ') || 'User',
                email: data.officialEmail,
                passwordHash: hashedPassword,
                phone: data.contactPhone,
                role: 'COMPANY_ADMIN',
                isEmailVerified: false,
                referralCode: tempReferralCode,
            },
        });
        const referralCode = (data.contactName.split(' ')[0].substring(0, 2) + data.contactName.split(' ').slice(1).join(' ').substring(0, 2)).toUpperCase() + String(user.id).padStart(4, '0');
        await prisma_1.default.user.update({ where: { id: user.id }, data: { referralCode } });
        await prisma_1.default.companyAdmin.create({
            data: {
                userId: user.id,
                companyId: company.id,
                role: 'admin',
            },
        });
        await (0, audit_service_1.createAuditLog)({
            adminId: user.id,
            action: 'COMPANY_REGISTERED',
            entityType: 'Company',
            entityId: company.id,
            newValue: { companyId: company.id, name: company.name, status: 'PENDING' },
        });
        await (0, notification_service_1.createNotification)({
            userId: user.id,
            type: 'COMPANY_APPROVED',
            title: 'Company Registration Submitted',
            message: `Your company "${company.name}" has been submitted for verification. You will be notified once approved.`,
            entityType: 'Company',
            entityId: company.id,
        });
        res.status(201).json({
            success: true,
            message: 'Company registration submitted successfully. Your company is pending verification.',
            data: {
                companyId: company.id,
                companyName: company.name,
                verificationStatus: company.verificationStatus,
            },
        });
    }
    catch (error) {
        console.error('Company registration error:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
            });
            return;
        }
        next(error);
    }
};
exports.registerCompany = registerCompany;
const getMyCompany = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const companyAdmin = await prisma_1.default.companyAdmin.findFirst({
            where: { userId },
            include: {
                company: true,
            },
        });
        if (!companyAdmin || !companyAdmin.company) {
            res.status(404).json({ success: false, message: 'Company not found' });
            return;
        }
        const company = companyAdmin.company;
        res.json({
            success: true,
            data: {
                id: company.id,
                name: company.name,
                logo: company.logo,
                industry: company.industry,
                companySize: company.companySize,
                foundedYear: company.foundedYear,
                website: company.website,
                description: company.description,
                country: company.country,
                state: company.state,
                city: company.city,
                address: company.address,
                contactName: company.contactName,
                designation: company.designation,
                contactPhone: company.contactPhone,
                contactEmail: company.contactEmail,
                verificationStatus: company.verificationStatus,
                verifiedAt: company.verifiedAt,
                isSuspended: company.isSuspended,
                createdAt: company.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyCompany = getMyCompany;
