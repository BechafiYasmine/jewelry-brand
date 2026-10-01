import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";

const ORDER_STATUSES = [
	"PENDING",
	"CONFIRMED",
	"SHIPPED",
	"DELIVERED",
	"CANCELLED",
];

// Public: customers submit an order. Prices are always read from the database.
export async function createOrder(req, res) {
	try {
		const {
			customerName,
			phone,
			wilaya,
			commune,
			deliveryMethod,
			notes,
			items,
		} = req.body ?? {};

		if (
			typeof customerName !== "string" ||
			!customerName.trim() ||
			typeof phone !== "string" ||
			!phone.trim() ||
			typeof wilaya !== "string" ||
			!wilaya.trim() ||
			typeof commune !== "string" ||
			!commune.trim() ||
			!["home", "office"].includes(deliveryMethod) ||
			!Array.isArray(items) ||
			items.length === 0 ||
			items.length > 50 ||
			(notes != null && (typeof notes !== "string" || notes.length > 500))
		) {
			return res.status(400).json({
				success: false,
				message: "Please provide valid customer, delivery and item details.",
			});
		}

		const quantities = new Map();

		for (const item of items) {
			const productId = Number(item?.productId);
			const quantity = Number(item?.quantity);

			if (
				!Number.isSafeInteger(productId) ||
				productId < 1 ||
				!Number.isSafeInteger(quantity) ||
				quantity < 1 ||
				quantity > 99
			) {
				return res.status(400).json({
					success: false,
					message: "Invalid product or quantity.",
				});
			}

			const combinedQuantity = (quantities.get(productId) || 0) + quantity;
			if (combinedQuantity > 99) {
				return res.status(400).json({
					success: false,
					message: "Maximum quantity per product is 99.",
				});
			}

			quantities.set(productId, combinedQuantity);
		}

		const productIds = [...quantities.keys()];
		const products = await prisma.product.findMany({
			where: { id: { in: productIds }, isActive: true },
		});

		if (products.length !== productIds.length) {
			return res.status(400).json({
				success: false,
				message: "One or more products are unavailable.",
			});
		}

		const orderItems = products.map((product) => ({
			productId: product.id,
			quantity: quantities.get(product.id),
			unitPrice: product.price,
		}));
		const subtotal = orderItems.reduce(
			(sum, item) => sum + item.unitPrice * item.quantity,
			0,
		);
		const deliveryFee = subtotal >= 6500 ? 0 : 500;
		const total = subtotal + deliveryFee;
		const orderNumber = `LN-${Date.now()}-${randomBytes(2)
			.toString("hex")
			.toUpperCase()}`;

		const order = await prisma.order.create({
			data: {
				orderNumber,
				customerName: customerName.trim().slice(0, 100),
				phone: phone.trim().slice(0, 24),
				wilaya: wilaya.trim().slice(0, 80),
				commune: commune.trim().slice(0, 80),
				deliveryMethod,
				notes: notes?.trim() || null,
				subtotal,
				deliveryFee,
				total,
				items: { create: orderItems },
			},
			include: {
				items: {
					include: {
						product: {
							select: { id: true, name: true, imageUrl: true, category: true },
						},
					},
				},
			},
		});

		return res.status(201).json({
			success: true,
			message: "Order created successfully.",
			order,
		});
	} catch (error) {
		console.error("Create order failed:", error);
		return res.status(500).json({
			success: false,
			message: "Unable to place your order.",
		});
	}
}

// Private: authenticated admins retrieve orders.
export async function getAdminOrders(_req, res) {
	try {
		const orders = await prisma.order.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				items: {
					include: {
						product: {
							select: { id: true, name: true, imageUrl: true, category: true },
						},
					},
				},
			},
		});

		return res.json({ success: true, count: orders.length, orders });
	} catch (error) {
		console.error("Fetch orders failed:", error);
		return res.status(500).json({
			success: false,
			message: "Unable to retrieve orders.",
		});
	}
}

// Private: authenticated admins update an order's status.
export async function updateOrderStatus(req, res) {
	try {
		const id = Number(req.params.id);
		const { status } = req.body ?? {};

		if (!Number.isSafeInteger(id) || id < 1) {
			return res.status(400).json({ success: false, message: "Invalid order ID." });
		}

		if (!ORDER_STATUSES.includes(status)) {
			return res.status(400).json({ success: false, message: "Invalid order status." });
		}

		const order = await prisma.order.update({ where: { id }, data: { status } });
		return res.json({ success: true, order });
	} catch (error) {
		if (error.code === "P2025") {
			return res.status(404).json({ success: false, message: "Order not found." });
		}

		console.error("Update order failed:", error);
		return res.status(500).json({
			success: false,
			message: "Unable to update order.",
		});
	}
}
