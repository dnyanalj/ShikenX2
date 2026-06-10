import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomAlphanumeric(length: number): string {
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[bytes[i]! % ALPHANUMERIC.length];
  }

  return result;
}

export async function generateUniqueExamKey(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const examKey = randomAlphanumeric(6);
    const existing = await prisma.exam.findUnique({
      where: { examKey },
      select: { id: true },
    });

    if (!existing) {
      return examKey;
    }
  }

  throw new Error("Failed to generate unique exam key");
}
