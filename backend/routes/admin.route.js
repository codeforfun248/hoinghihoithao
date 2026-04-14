import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.get(
  "/stats",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.getDashboardStats,
);

// ============ User Management ============
router.get(
  "/users",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.getUsers_ByFields,
);

router.post(
  "/users",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.addUser,
);

router.put(
  "/users/:id",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.updateUser,
);

router.delete(
  "/users/:id",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.deleteUser,
);

// ============ Faculty Management ============
router.get("/faculties", adminController.getFaculties_ByFields);

router.post(
  "/faculties",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.addFaculty,
);

router.put(
  "/faculties/:id",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.updateFaculty,
);

router.delete(
  "/faculties/:id",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  adminController.deleteFaculty,
);

export default router;
