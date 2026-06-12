import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/requireRole";
import examCrudRoutes from "../../routes/exam";
import questionRoutes from "../../routes/question";
import * as examController from "./exam.controller";

const router = Router();

router.use(authenticate, requireRole("teacher"));

router.get("/my-exams", examController.getMyExams);
router.get("/stats", examController.getStats);

router.use(examCrudRoutes);
router.use(questionRoutes);

export default router;
