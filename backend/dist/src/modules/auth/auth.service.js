"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTeacher = registerTeacher;
exports.registerStudent = registerStudent;
exports.loginTeacher = loginTeacher;
exports.loginStudent = loginStudent;
exports.loginAdmin = loginAdmin;
exports.getMe = getMe;
const prisma_1 = require("../../lib/prisma");
const errors_1 = require("../../lib/errors");
const password_1 = require("../../lib/password");
const jwt_1 = require("../../lib/jwt");
const INVALID_CREDENTIALS = "Invalid email or password";
const EMAIL_IN_USE = "Email is already registered";
const ACCOUNT_DISABLED = "Account has been disabled";
async function isEmailTaken(email) {
    const normalizedEmail = email.toLowerCase();
    const [teacher, student, admin] = await Promise.all([
        prisma_1.prisma.teacher.findUnique({ where: { email: normalizedEmail } }),
        prisma_1.prisma.student.findUnique({ where: { email: normalizedEmail } }),
        prisma_1.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
    ]);
    return Boolean(teacher || student || admin);
}
function toAuthUser(user, role) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
    };
}
function buildAuthResponse(user, role) {
    const authUser = toAuthUser(user, role);
    const accessToken = (0, jwt_1.signAccessToken)({
        sub: user.id,
        role,
        email: user.email,
    });
    return { user: authUser, accessToken };
}
async function registerTeacher(input) {
    const email = input.email.toLowerCase();
    if (await isEmailTaken(email)) {
        throw new errors_1.AppError(409, EMAIL_IN_USE);
    }
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const teacher = await prisma_1.prisma.teacher.create({
        data: {
            name: input.name.trim(),
            email,
            password: passwordHash,
        },
    });
    return buildAuthResponse(teacher, "teacher");
}
async function registerStudent(input) {
    const email = input.email.toLowerCase();
    if (await isEmailTaken(email)) {
        throw new errors_1.AppError(409, EMAIL_IN_USE);
    }
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const student = await prisma_1.prisma.student.create({
        data: {
            name: input.name.trim(),
            email,
            password: passwordHash,
        },
    });
    return buildAuthResponse(student, "student");
}
async function loginTeacher(input) {
    const email = input.email.toLowerCase();
    const teacher = await prisma_1.prisma.teacher.findUnique({ where: { email } });
    if (!teacher) {
        throw new errors_1.AppError(401, INVALID_CREDENTIALS);
    }
    if (!teacher.isActive) {
        throw new errors_1.AppError(403, ACCOUNT_DISABLED);
    }
    const valid = await (0, password_1.comparePassword)(input.password, teacher.password);
    if (!valid) {
        throw new errors_1.AppError(401, INVALID_CREDENTIALS);
    }
    return buildAuthResponse(teacher, "teacher");
}
async function loginStudent(input) {
    const email = input.email.toLowerCase();
    const student = await prisma_1.prisma.student.findUnique({ where: { email } });
    if (!student) {
        throw new errors_1.AppError(401, INVALID_CREDENTIALS);
    }
    if (!student.isActive) {
        throw new errors_1.AppError(403, ACCOUNT_DISABLED);
    }
    const valid = await (0, password_1.comparePassword)(input.password, student.password);
    if (!valid) {
        throw new errors_1.AppError(401, INVALID_CREDENTIALS);
    }
    return buildAuthResponse(student, "student");
}
async function loginAdmin(input) {
    const email = input.email.toLowerCase();
    const admin = await prisma_1.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
        throw new errors_1.AppError(401, INVALID_CREDENTIALS);
    }
    if (!admin.isActive) {
        throw new errors_1.AppError(403, ACCOUNT_DISABLED);
    }
    const valid = await (0, password_1.comparePassword)(input.password, admin.password);
    if (!valid) {
        throw new errors_1.AppError(401, INVALID_CREDENTIALS);
    }
    return buildAuthResponse(admin, "admin");
}
async function getMe(userId, role) {
    if (role === "teacher") {
        const teacher = await prisma_1.prisma.teacher.findUnique({ where: { id: userId } });
        if (!teacher || !teacher.isActive) {
            throw new errors_1.AppError(401, "User not found");
        }
        return toAuthUser(teacher, "teacher");
    }
    if (role === "student") {
        const student = await prisma_1.prisma.student.findUnique({ where: { id: userId } });
        if (!student || !student.isActive) {
            throw new errors_1.AppError(401, "User not found");
        }
        return toAuthUser(student, "student");
    }
    const admin = await prisma_1.prisma.admin.findUnique({ where: { id: userId } });
    if (!admin || !admin.isActive) {
        throw new errors_1.AppError(401, "User not found");
    }
    return toAuthUser(admin, "admin");
}
