"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueExamKey = generateUniqueExamKey;
const node_crypto_1 = require("node:crypto");
const prisma_1 = require("./prisma");
const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function randomAlphanumeric(length) {
    const bytes = (0, node_crypto_1.randomBytes)(length);
    let result = "";
    for (let i = 0; i < length; i++) {
        result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
    }
    return result;
}
async function generateUniqueExamKey() {
    for (let attempt = 0; attempt < 10; attempt++) {
        const examKey = randomAlphanumeric(6);
        const existing = await prisma_1.prisma.exam.findUnique({
            where: { examKey },
            select: { id: true },
        });
        if (!existing) {
            return examKey;
        }
    }
    throw new Error("Failed to generate unique exam key");
}
