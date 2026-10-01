import express from "express";
import { loginAdmin } from "../controllers/adminController.js";
import {
	getAdminOrders,
	updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/orders", requireAdmin, getAdminOrders);
router.patch("/orders/:id/status", requireAdmin, updateOrderStatus);

export default router;