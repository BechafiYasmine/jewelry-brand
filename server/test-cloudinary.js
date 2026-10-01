import "dotenv/config";
import cloudinary from "./lib/cloudinary.js";

try {
  const result = await cloudinary.api.ping();
  console.log("Cloudinary connection successful:", result.status);
} catch (error) {
  console.error(
    "Cloudinary connection failed:",
    error?.error?.message ?? error?.message ?? String(error),
  );
  process.exitCode = 1;
}
