"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const exam_routes_1 = __importDefault(require("./modules/exam/exam.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.frontendUrl,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/exam", exam_routes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(env_1.env.port, () => {
    console.log(`ShikenX API running on http://localhost:${env_1.env.port}`);
});
