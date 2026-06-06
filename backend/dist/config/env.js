"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 5000),
    databaseUrl: requireEnv("DATABASE_URL"),
    jwtSecret: requireEnv("JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
    frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
    adminSeedName: process.env.ADMIN_SEED_NAME ?? "Platform Admin",
    adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? "admin@shikenx.com",
    adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? "Admin@123456",
};
exports.isProduction = exports.env.nodeEnv === "production";
