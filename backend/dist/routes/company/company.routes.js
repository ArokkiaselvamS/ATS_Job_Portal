"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const company_controller_1 = require("../../controllers/company/company.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, SVG, and WebP are allowed.'));
        }
    },
});
// Make logo field optional - use fields() with optional logo
const optionalUpload = upload.fields([{ name: 'logo', maxCount: 1 }]);
router.post('/register', optionalUpload, company_controller_1.registerCompany);
router.get('/me', auth_middleware_1.requireAuth, company_controller_1.getMyCompany);
exports.default = router;
