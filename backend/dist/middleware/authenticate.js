"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuthenticate = optionalAuthenticate;
const jwt_1 = require("../lib/jwt");
const auth_1 = require("../types/auth");
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    return req.cookies?.[auth_1.ACCESS_TOKEN_COOKIE];
}
function authenticate(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    try {
        req.user = (0, jwt_1.verifyAccessToken)(token);
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
function optionalAuthenticate(req, _res, next) {
    const token = extractToken(req);
    if (token) {
        try {
            req.user = (0, jwt_1.verifyAccessToken)(token);
        }
        catch {
            // Ignore invalid token for optional auth
        }
    }
    next();
}
