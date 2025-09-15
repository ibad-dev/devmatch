  import { v2 as cloudinary } from "cloudinary";
  import type {
    UploadApiResponse,
    UploadApiErrorResponse,
    DeleteApiResponse,
  } from "cloudinary";

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

//Upload a file buffer to Cloudinary.
 
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) {
            console.error("Cloudinary upload failed:", error);
            return reject(new Error("Failed to upload file to Cloudinary"));
          }
          if (!result) {
            return reject(new Error("No response received from Cloudinary"));
          }
          resolve(result);
        }
      )
      .end(buffer);
  });
}

// Delete a resource from Cloudinary.

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<DeleteApiResponse> {
  try {
    console.log(
      `Attempting to delete Cloudinary resource with public ID: ${publicId} (type: ${resourceType})`
    );

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("Cloudinary deletion result:", result);

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(
        `Unexpected deletion result for ${publicId}: ${result.result}`
      );
    }

    
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", {
      message: error instanceof Error ? error.message : "Unknown error",
      publicId,
      resourceType,
      stack: error instanceof Error ? error.stack : undefined,
      errorObject: error,
    });
    throw error;
  }
}
