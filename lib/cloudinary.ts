import { v2 as cloudinary } from "cloudinary";

// ✅ Configure Cloudinary with your env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ✅ Upload function
export async function uploadToCloudinary(buffer: Buffer, folder: string) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto", // smart detect
          folder,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });
}

// ✅ Delete function with proper resource type handling
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
) {
  try {
    console.log(
      `Attempting to delete Cloudinary resource with public ID: ${publicId} (type: ${resourceType})`
    );
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Cloudinary deletion result:", result);
    if (result.result !== "ok") {
      console.warn(
        `Cloudinary deletion returned unexpected result: ${result.result}`
      );
    }
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", {
      message: error instanceof Error ? error.message : "Unknown error",
      publicId: publicId,
      resourceType: resourceType,
      stack: error instanceof Error ? error.stack : undefined,
      errorObject: error,
    });
    throw error; // Re-throw the error after logging
  }
}
