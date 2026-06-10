import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import examRoutes from "./modules/exam/exam.routes";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/exam", examRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`ShikenX API running on http://localhost:${env.port}`);
});
