import express from "express";
import registrationsController from "../controllers/registration.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post(
  "/",
  authMiddleware.verifyUser,
  registrationsController.addRegistration,
);
router.get("/", registrationsController.getRegistrations_ByFields);
router.delete(
  "/:id",
  authMiddleware.verifyUser,
  registrationsController.deleteRegistration,
);
router.put(
  "/:id",
  authMiddleware.verifyUser,
  registrationsController.updateRegistration,
);

export default router;
