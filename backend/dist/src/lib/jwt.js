"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtSecret, {
        expiresIn: env_1.env.jwtExpiresIn,
    });
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
    if (typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.sub !== "string" ||
        typeof decoded.email !== "string" ||
        (decoded.role !== "teacher" &&
            decoded.role !== "student" &&
            decoded.role !== "admin")) {
        throw new Error("Invalid token payload");
    }
    return {
        sub: decoded.sub,
        role: decoded.role,
        email: decoded.email,
    };
}
