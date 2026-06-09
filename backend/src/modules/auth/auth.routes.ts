import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validateBody } from "../../middleware/validate";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post(
  "/teacher/register",
  validateBody(registerSchema),
  authController.registerTeacher,
);

router.post(
  "/teacher/login",
  validateBody(loginSchema),
  authController.loginTeacher,
);

router.post(
  "/student/register",
  validateBody(registerSchema),
  authController.registerStudent,
);

router.post(
  "/student/login",
  validateBody(loginSchema),
  authController.loginStudent,
);

router.post(
  "/admin/login",
  validateBody(loginSchema),
  authController.loginAdmin,
);

router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);

export default router;
