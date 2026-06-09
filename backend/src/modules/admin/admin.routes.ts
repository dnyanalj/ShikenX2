import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/requireRole";
import { validateQuery } from "../../middleware/validate";
import * as adminController from "./admin.controller";
import { paginationSchema } from "./admin.schema";

const router = Router();

router.use(authenticate, requireRole("admin"));
router.get("/stats", adminController.getStats);
router.get(
  "/teachers",
  validateQuery(paginationSchema),
  adminController.getTeachers,
);
router.get(
  "/students",
  validateQuery(paginationSchema),
  adminController.getStudents,
);

export default router;
