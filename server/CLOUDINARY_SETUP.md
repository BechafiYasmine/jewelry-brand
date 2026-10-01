# Cloudinary product image uploads

The admin product form uses authenticated API signatures and uploads directly from the browser to Cloudinary. The API signing endpoint expects these existing server-only variables in `server/.env`:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_PRODUCT_UPLOAD_PRESET`

Create the preset in the Cloudinary Console and configure it as follows:

- Preset name must match `CLOUDINARY_PRODUCT_UPLOAD_PRESET` exactly.
- Use **signed** uploads (do not enable unsigned uploads for this admin flow).
- Restrict allowed formats to JPG/JPEG, PNG, and WebP.
- Set the maximum file size to **5 MB**.
- Set the destination folder to `lunea/products`.

The backend also signs `allowed_formats` and a unique public ID for every request. The frontend checks file type and size for usability, but the Cloudinary preset is necessary to enforce the maximum size at the upload service. Keep the API secret in `server/.env`; never expose it through Vite variables or return it from an endpoint. Confirm `server/.env` remains Git-ignored before committing.
