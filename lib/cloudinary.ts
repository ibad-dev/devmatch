import cloudinary from "cloudinary";
import { Readable } from "stream";

// Set up Cloudinary configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Missing Cloudinary configuration");
}
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  // ... other Cloudinary response fields
}

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string
): Promise<CloudinaryResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder, // Folder name in Cloudinary
        resource_type: "auto", // Automatically detect file type (image, video, etc.)
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Cloudinary returned undefined result"));
        }
      }
    );

    // Convert buffer to stream and pipe it to Cloudinary upload
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null); // End of stream
    bufferStream.pipe(stream); // Pipe the buffer stream to Cloudinary
  });
};
