"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const jobMatching_service_1 = require("../services/jobMatching.service");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const matches = await (0, jobMatching_service_1.getMatchesForUser)(req.user.userId);
        res.json({ success: true, data: { matches, count: matches.length } });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:jobId', auth_middleware_1.requireAuth, async (req, res, next) => {
    try {
        const match = await (0, jobMatching_service_1.getMatchForJob)(req.user.userId, parseInt(req.params.jobId));
        res.json({ success: true, data: match });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
