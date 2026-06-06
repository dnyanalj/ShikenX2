import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
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

export const isProduction = env.nodeEnv === "production";
