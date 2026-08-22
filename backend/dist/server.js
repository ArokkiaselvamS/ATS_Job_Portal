"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./utils/prisma"));
const startServer = async () => {
    try {
        // Check database connection
        await prisma_1.default.$connect();
        console.log('✅ Connected to PostgreSQL database via Prisma');
        const port = env_1.env.PORT || 5000;
        app_1.default.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
