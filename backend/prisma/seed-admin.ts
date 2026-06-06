import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL ?? "admin@shikenx.com").toLowerCase();
  const name = process.env.ADMIN_SEED_NAME ?? "Platform Admin";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "Admin@123456";

  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: {
      name,
      email,
      password: passwordHash,
    },
  });

  console.log(`Admin created: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
