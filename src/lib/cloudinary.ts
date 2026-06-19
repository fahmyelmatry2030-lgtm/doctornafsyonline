import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let isConfigured = false;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  isConfigured = true;
}

/**
 * Uploads a file buffer directly to Cloudinary.
 * If Cloudinary is not configured, it throws an error or fallback message.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  fileName: string
): Promise<string> {
  if (!isConfigured) {
    console.warn("[Cloudinary] Credentials not configured. Falling back to local upload logic.");
    throw new Error("Cloudinary configuration missing. Please check your environment variables.");
  }

  return new Promise((resolve, reject) => {
    // Strip file extension to get public_id
    const publicId = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `nafsi/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          return reject(error);
        }
        if (result && result.secure_url) {
          return resolve(result.secure_url);
        }
        reject(new Error("Upload result was empty"));
      }
    );

    uploadStream.end(fileBuffer);
  });
}
