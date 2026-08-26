"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParamId = getParamId;
exports.getQueryParam = getQueryParam;
function getParamId(req) {
    return parseInt(String(req.params.id));
}
function getQueryParam(req, key, defaultValue) {
    const val = req.query[key];
    if (val === undefined || val === null)
        return defaultValue;
    return String(val);
}
