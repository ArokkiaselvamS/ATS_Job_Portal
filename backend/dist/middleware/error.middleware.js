"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors || err.issues,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
