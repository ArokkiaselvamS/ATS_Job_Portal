"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const referral_routes_1 = __importDefault(require("./routes/referral.routes"));
const index_1 = __importDefault(require("./routes/admin/index"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
}));
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Aescion API is running' });
});
// Routes — ORDER MATTERS: /api/admin must come BEFORE /api
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', index_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/matches', match_routes_1.default);
app.use('/api', referral_routes_1.default);
// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// Global error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
