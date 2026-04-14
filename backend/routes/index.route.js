import express from "express";
const router = express.Router();
import authRoute from "./auth.route.js";
import adminRoute from "./admin.route.js";
import uploadRoute from "./upload.route.js";
import conferenceRoute from "./conference.route.js";
import submissionsRoute from "./submissions.route.js";
import registrationsRoute from "./registration.route.js";

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/upload", uploadRoute);

router.use("/conferences", conferenceRoute);
router.use("/submissions", submissionsRoute);
router.use("/registrations", registrationsRoute);

export default router;
