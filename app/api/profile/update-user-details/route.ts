import { authOptions } from "@/lib/auth";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import dbConnect from "@/lib/db";
import { secureHandler } from "@/middlewares/secureHandler";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Define schema for profile update with strict validation
const profileSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").max(300, "Bio cannot exceed 300 characters").optional(),
  skills: z.array(z.string().min(1, "Skills cannot be empty")).optional(),
  location: z.string().max(100, "Location cannot exceed 100 characters").optional(),
  socials: z
    .object({
      github: z.string().url("Invalid GitHub URL").optional(),
      linkedin: z.string().url("Invalid LinkedIn URL").optional(),
      X: z.string().url("Invalid X URL").optional(),
      portfolio: z.string().url("Invalid portfolio URL").optional(),
    })
    .optional(),
});

export const PUT = secureHandler(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Connect to MongoDB
      await dbConnect();

      // Verify user authentication
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.email) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      // Find user by email
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Parse form data
      const formData = await req.formData();
      const body: Record<string, any> = Object.fromEntries(formData.entries());
      console.log("Form data received:", body);

      // Convert skills string to array if provided
      if (body.skills && typeof body.skills === "string") {
        body.skills = body.skills.split(",").map((s: string) => s.trim());
      }

      // Validate input against schema
      const validation = profileSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid input",
            errors: validation.error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      // Prepare update data
      const updateData: Record<string, any> = { ...validation.data };

      // Handle image upload
      let oldImagePublicId: string | null = null;
      if (formData.has("files")) {
        const files = formData.getAll("files");
        if (files.length > 1) {
          return NextResponse.json(
            { success: false, message: "Only one profile image allowed" },
            { status: 400 }
          );
        }

        const file = files[0];
        if (file instanceof File) {
          // Validate image type and size
          const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
              { success: false, message: "Invalid image type. Allowed types: JPEG, PNG, WebP" },
              { status: 400 }
            );
          }
          if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
              { success: false, message: "Image size exceeds 5MB" },
              { status: 400 }
            );
          }

          // Extract old image public ID if exists
          if (user.profileImage) {
            try {
              const url = user.profileImage;
              const parts = url.split("/upload/");
              if (parts.length === 2) {
                let path = parts[1];
                // Remove version number (e.g., v1746367572) if present
                const versionMatch = path.match(/^v\d+\//);
                if (versionMatch) {
                  path = path.slice(versionMatch[0].length); // Remove v123.../
                }
                const publicId = path.split(".")[0]; // Remove file extension
                oldImagePublicId = publicId; // e.g., profiles/image123
                console.log(`Extracted old public ID: ${oldImagePublicId}`);
              } else {
                console.warn(`Invalid Cloudinary URL format: ${url}`);
              }
            } catch (err) {
              console.warn("Failed to extract public ID from URL:", err);
            }
          }

          // Upload new image to Cloudinary
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploaded = (await uploadToCloudinary(buffer, "profiles")) as {
            secure_url: string;
            public_id: string;
          };
          updateData.profileImage = uploaded.secure_url;
          console.log(`Uploaded new image: ${uploaded.secure_url}`);
        }
      }

      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true }
      );

      // Delete old image from Cloudinary if replaced
      if (oldImagePublicId && updateData.profileImage) {
        try {
          const deletionResult = await deleteFromCloudinary(oldImagePublicId, "image");
          if (deletionResult.result === "ok") {
            console.log(`Successfully deleted old image with public ID: ${oldImagePublicId}`);
          } else {
            console.warn(
              `Failed to delete old image with public ID ${oldImagePublicId}. Result:`,
              deletionResult
            );
          }
        } catch (err) {
          console.warn("Error deleting old image from Cloudinary:", err);
        }
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update profile",
          error: (error as Error).message,
        },
        { status: 500 }
      );
    }
  }
);