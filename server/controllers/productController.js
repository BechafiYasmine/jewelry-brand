import { prisma } from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";
import { randomBytes } from "node:crypto";

const PRODUCT_CATEGORIES = ["Necklaces", "Rings", "Earrings", "Bracelets", "Sets"];
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function validateProductInput(input, { partial = false } = {}) {
  const errors = [];
  const data = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(input, key);

  if (!partial || has("name")) {
    if (typeof input.name !== "string" || !input.name.trim()) errors.push("Product name is required.");
    else data.name = input.name.trim().slice(0, 160);
  }

  if (!partial || has("slug")) {
    if (typeof input.slug !== "string" || input.slug.trim().length > 191 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim())) {
      errors.push("Slug must contain lowercase letters, numbers, and single hyphens only.");
    } else data.slug = input.slug.trim();
  }

  if (!partial || has("description")) {
    if (typeof input.description !== "string" || !input.description.trim()) errors.push("Description is required.");
    else if (input.description.trim().length > 5000) errors.push("Description must be 5,000 characters or fewer.");
    else data.description = input.description.trim();
  }

  if (!partial || has("category")) {
    if (!PRODUCT_CATEGORIES.includes(input.category)) errors.push(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`);
    else data.category = input.category;
  }

  for (const key of ["price", "stock"]) {
    if (!partial || has(key)) {
      const rawValue = input[key];
      const value = typeof rawValue === "number" || (typeof rawValue === "string" && rawValue.trim() !== "")
        ? Number(rawValue)
        : Number.NaN;
      if (!Number.isSafeInteger(value) || value < 0 || value > 2147483647) errors.push(`${key === "price" ? "Price" : "Stock"} must be a valid non-negative whole number.`);
      else data[key] = value;
    }
  }

  if (!partial || has("imageUrl")) {
    if (typeof input.imageUrl !== "string" || !isValidImageUrl(input.imageUrl.trim())) {
      errors.push("A valid HTTPS image URL is required.");
    } else data.imageUrl = input.imageUrl.trim();
  }

  for (const [key, label] of [["imageScale", "Image zoom"], ["imagePositionX", "Horizontal image position"], ["imagePositionY", "Vertical image position"]]) {
    if (has(key)) {
      const value = input[key];
      const validInteger = Number.isSafeInteger(value);
      const min = key === "imageScale" ? 100 : 0;
      const max = key === "imageScale" ? 250 : 100;
      if (!validInteger || value < min || value > max) {
        errors.push(`${label} must be a whole number from ${min} to ${max}.`);
      } else {
        data[key] = value;
      }
    } else if (!partial) {
      data[key] = key === "imageScale" ? 100 : 50;
    }
  }

  if (has("badge")) {
    if (input.badge != null && typeof input.badge !== "string") errors.push("Badge must be text.");
    else data.badge = input.badge?.trim().slice(0, 60) || null;
  } else if (!partial) {
    data.badge = null;
  }

  if (has("isActive")) {
    if (typeof input.isActive !== "boolean") errors.push("Active status must be true or false.");
    else data.isActive = input.isActive;
  } else if (!partial) {
    data.isActive = true;
  }

  return { errors, data };
}

function isValidImageUrl(value) {
  if (value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function handleProductWriteError(error, res) {
  if (error.code === "P2002") {
    return res.status(409).json({ success: false, message: "That product slug is already in use." });
  }
  if (error.code === "P2025") {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  console.error("Product management request failed:", error);
  return res.status(500).json({ success: false, message: "Unable to save the product." });
}

// GET /api/products
// Retrieve all active products from the database
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve products.",
    });
  }
};

// GET /api/products/:id
// Retrieve one active product by its ID
export const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve the product.",
    });
  }
};

// Admin: list products, including inactive entries, with optional filters.
export async function getAdminProducts(req, res) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category : "";
    const status = typeof req.query.status === "string" ? req.query.status : "all";
    const where = {};

    if (search) where.name = { contains: search.slice(0, 100) };
    if (PRODUCT_CATEGORIES.includes(category)) where.category = category;
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    const products = await prisma.product.findMany({ where, orderBy: { createdAt: "desc" } });
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Admin product list failed:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve products." });
  }
}

// Admin: retrieve one product for editing.
export async function getAdminProductById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: "Invalid product ID." });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.json({ success: true, product });
  } catch (error) {
    console.error("Admin product fetch failed:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve the product." });
  }
}

async function saveProduct(req, res, { id, partial }) {
  const updating = id !== undefined;
  const { errors, data } = validateProductInput(req.body ?? {}, { partial });
  if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

  if (updating && (!Number.isSafeInteger(id) || id < 1)) {
    return res.status(400).json({ success: false, message: "Invalid product ID." });
  }

  try {
    if (data.slug) {
      const slugMatch = await prisma.product.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (slugMatch && slugMatch.id !== id) {
        return res.status(409).json({ success: false, message: "That product slug is already in use." });
      }
    }

    const product = updating
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data });

    return res.status(updating ? 200 : 201).json({ success: true, product });
  } catch (error) {
    return handleProductWriteError(error, res);
  }
}

export async function createAdminProduct(req, res) {
  return saveProduct(req, res, { partial: false });
}

export async function updateAdminProduct(req, res) {
  const id = Number(req.params.id);
  return saveProduct(req, res, { id, partial: true });
}

export async function setAdminProductStatus(req, res) {
  const id = Number(req.params.id);
  const { isActive } = req.body ?? {};
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: "Invalid product ID." });
  }
  if (typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "Active status must be true or false." });
  }

  try {
    const product = await prisma.product.update({ where: { id }, data: { isActive } });
    return res.json({ success: true, product });
  } catch (error) {
    return handleProductWriteError(error, res);
  }
}

// Deactivation preserves product/order history and is safe for referenced products.
export async function deactivateAdminProduct(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: "Invalid product ID." });
  }

  try {
    const product = await prisma.product.update({ where: { id }, data: { isActive: false } });
    return res.json({ success: true, product, message: "Product deactivated. Order history was preserved." });
  } catch (error) {
    return handleProductWriteError(error, res);
  }
}

// Signed direct-to-Cloudinary upload; only the signature and public upload config leave the server.
export async function createProductUploadSignature(_req, res) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_PRODUCT_UPLOAD_PRESET;
  if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
    return res.status(503).json({
      success: false,
      message: "Image uploads are not configured. Set the Cloudinary product upload preset.",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `product-${Date.now()}-${randomBytes(6).toString("hex")}`;
  const allowedFormats = IMAGE_FORMATS.join(",");
  const paramsToSign = {
    timestamp,
    upload_preset: uploadPreset,
    public_id: publicId,
    allowed_formats: allowedFormats,
  };

  try {
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    return res.json({
      success: true,
      cloudName,
      apiKey,
      timestamp,
      uploadPreset,
      publicId,
      allowedFormats,
      signature,
      maxFileSizeBytes: MAX_IMAGE_SIZE_BYTES,
    });
  } catch (error) {
    console.error("Cloudinary signature generation failed:", error);
    return res.status(500).json({ success: false, message: "Unable to prepare image upload." });
  }
}
