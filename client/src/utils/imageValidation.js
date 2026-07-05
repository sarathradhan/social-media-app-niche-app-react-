// Shared image upload validation rules used by client-side forms before files are sent to the API.
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, message: "Please choose an image file." };
  }

  const extension = file.name?.slice(file.name.lastIndexOf("."))?.toLowerCase() || "";
  const hasValidType = ALLOWED_IMAGE_TYPES.includes(file.type?.toLowerCase());
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!hasValidType || !hasValidExtension) {
    return { valid: false, message: "Only JPG, PNG, WebP, or GIF images are allowed." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { valid: false, message: "Image size must be 5 MB or less." };
  }

  return { valid: true };
}
