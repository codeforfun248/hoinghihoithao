import express from "express";
import submissionsController from "../controllers/submissions.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post(
  "/",
  authMiddleware.verifyUser,
  submissionsController.addSubmission,
);
router.get("/", submissionsController.getSubmissions_ByFields);
router.delete(
  "/:id",
  authMiddleware.verifyUser,
  submissionsController.deleteSubmission,
);
router.put(
  "/:id",
  authMiddleware.verifyUser,
  submissionsController.updateSubmission,
);

export default router;
