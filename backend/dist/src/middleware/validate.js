"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
const errors_1 = require("../lib/errors");
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.errors.map((e) => e.message).join(", ");
            next(new errors_1.AppError(400, message));
            return;
        }
        req.body = result.data;
        next();
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const message = result.error.errors.map((e) => e.message).join(", ");
            next(new errors_1.AppError(400, message));
            return;
        }
        req.query = result.data;
        next();
    };
}
