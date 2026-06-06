"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../lib/errors");
function errorHandler(err, _req, res, _next) {
    if ((0, errors_1.isAppError)(err)) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
}
