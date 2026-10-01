import express from "express";
import { loginAdmin } from "../controllers/adminController.js";
import {
	getAdminOrders,
	updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";
import {
	createAdminProduct,
	createProductUploadSignature,
	deactivateAdminProduct,
	getAdminProductById,
	getAdminProducts,
	setAdminProductStatus,
	updateAdminProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/orders", requireAdmin, getAdminOrders);
router.patch("/orders/:id/status", requireAdmin, updateOrderStatus);

router.get("/products", requireAdmin, getAdminProducts);
router.post("/products/upload-signature", requireAdmin, createProductUploadSignature);
router.get("/products/:id", requireAdmin, getAdminProductById);
router.post("/products", requireAdmin, createAdminProduct);
router.patch("/products/:id", requireAdmin, updateAdminProduct);
router.patch("/products/:id/status", requireAdmin, setAdminProductStatus);
router.delete("/products/:id", requireAdmin, deactivateAdminProduct);

export default router;