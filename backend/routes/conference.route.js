import express from "express";
import conferenceController from "../controllers/conference.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", authMiddleware.verifyUser, conferenceController.addConference);
router.get("/", conferenceController.getConferences_ByFields);
router.post(
  "/register-participate",
  authMiddleware.verifyUser,
  conferenceController.registerParticipate,
);

router.post(
  "/check-registration",
  authMiddleware.verifyUser,
  conferenceController.checkRegistration,
);
router.delete(
  "/:id",
  authMiddleware.verifyUser,
  conferenceController.deleteConference,
);
router.put(
  "/:id",
  authMiddleware.verifyUser,
  conferenceController.updateConference,
);

export default router;
