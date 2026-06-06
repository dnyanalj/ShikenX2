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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTeacher = registerTeacher;
exports.registerStudent = registerStudent;
exports.loginTeacher = loginTeacher;
exports.loginStudent = loginStudent;
exports.loginAdmin = loginAdmin;
exports.me = me;
exports.logout = logout;
const env_1 = require("../../config/env");
const auth_1 = require("../../types/auth");
const authService = __importStar(require("./auth.service"));
const COOKIE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
function setAccessTokenCookie(res, token) {
    res.cookie(auth_1.ACCESS_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: env_1.isProduction,
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE_MS,
    });
}
function sendAuthResponse(res, statusCode, result) {
    setAccessTokenCookie(res, result.accessToken);
    res.status(statusCode).json(result);
}
async function registerTeacher(req, res, next) {
    try {
        const result = await authService.registerTeacher(req.body);
        sendAuthResponse(res, 201, result);
    }
    catch (error) {
        next(error);
    }
}
async function registerStudent(req, res, next) {
    try {
        const result = await authService.registerStudent(req.body);
        sendAuthResponse(res, 201, result);
    }
    catch (error) {
        next(error);
    }
}
async function loginTeacher(req, res, next) {
    try {
        const result = await authService.loginTeacher(req.body);
        sendAuthResponse(res, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function loginStudent(req, res, next) {
    try {
        const result = await authService.loginStudent(req.body);
        sendAuthResponse(res, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function loginAdmin(req, res, next) {
    try {
        const result = await authService.loginAdmin(req.body);
        sendAuthResponse(res, 200, result);
    }
    catch (error) {
        next(error);
    }
}
async function me(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const user = await authService.getMe(req.user.sub, req.user.role);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
function logout(_req, res) {
    res.clearCookie(auth_1.ACCESS_TOKEN_COOKIE, {
        httpOnly: true,
        secure: env_1.isProduction,
        sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
}
