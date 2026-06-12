"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../../middleware/authenticate");
const requireRole_1 = require("../../middleware/requireRole");
const question_1 = __importDefault(require("../../routes/question"));
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate, (0, requireRole_1.requireRole)("teacher"));
router.use(question_1.default);
exports.default = router;
