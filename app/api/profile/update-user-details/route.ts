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
  name: z.string().min(2, "Name must be at least 3 characters").max(50, "Name cannot exceed 30 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 15 characters").optional(),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(300, "Bio cannot exceed 300 characters")
    .optional(),
  skills: z.array(z.string().min(1, "Skills cannot be empty")).optional(),
  location: z.string().max(50, "Location cannot exceed 50 characters").optional(),
  socials: z
    .object({
      github: z.string().url("Invalid GitHub URL").optional(),
      linkedin: z.string().url("Invalid LinkedIn URL").optional(),
      twitter: z.string().url("Invalid Twitter URL").optional(),
      portfolio: z.string().url("Invalid portfolio URL").optional(),
    })
    .optional(),
});

export const PUT = secureHandler(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      await dbConnect();

      const session = await getServerSession(authOptions);
      if (!session || !session.user?.email) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      const formData = await req.formData();
      const body: Record<string, any> = Object.fromEntries(formData.entries());
      console.log("Form data received:", body);
      
      // Parse skills safely
      if (body.skills && typeof body.skills === "string") {
        try {
          body.skills = JSON.parse(body.skills);
        } catch {
          throw Error("failed to parse the skills")
        }
      }
// Parse socials 
if (body.socials && typeof body.socials === "string") {
  try {
    const cleanedSocials = body.socials.replace(/'/g, '"'); 
    const parsedSocials = JSON.parse(cleanedSocials);
    
    // Validate with your schema
    const socialsSchema = z.object({
      github: z.string().url("Invalid GitHub URL").optional(),
      linkedin: z.string().url("Invalid LinkedIn URL").optional(),
      twitter: z.string().url("Invalid Twitter URL").optional(),
      portfolio: z.string().url("Invalid portfolio URL").optional(),
    });
    
    const validatedSocials = socialsSchema.parse(parsedSocials);
    
    // Merge with existing socials, filtering out empty strings
    body.socials = {
      github: validatedSocials.github !== undefined ? validatedSocials.github : user.socials.github,
      linkedin: validatedSocials.linkedin !== undefined ? validatedSocials.linkedin : user.socials.linkedin,
      twitter: validatedSocials.twitter !== undefined ? validatedSocials.twitter : user.socials.twitter,
      portfolio: validatedSocials.portfolio !== undefined ? validatedSocials.portfolio : user.socials.portfolio,
    };
    
    console.log("Merged socials:", body.socials); 
  } catch (err: any) {
    console.error("Socials parse error:", err.message);
    console.error("Raw socials that failed:", body.socials); 
    return NextResponse.json({ message: "Failed to parse socials" });
  }
}
console.log("DATA:",body)
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

      const updateData: Record<string, any> = { ...validation.data };
      console.log("UPDATED_DATA",updateData)

      // Handle image upload
      let oldImagePublicId: string | null = null;
      if (formData.has("profileImage")) {
        const files = formData.getAll("profileImage");
        if (files.length > 1) {
          return NextResponse.json(
            { success: false, message: "Only one profile image allowed" },
            { status: 400 }
          );
        }

        const file = files[0];
        if (file instanceof File) {
          const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid image type. Allowed types: JPEG, PNG, WebP",
              },
              { status: 400 }
            );
          }
          if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
              { success: false, message: "Image size exceeds 5MB" },
              { status: 400 }
            );
          }

          // Keep track of old image for later deletion
          if (user.profileImagePublicId) {
            oldImagePublicId = user.profileImagePublicId;
          }

          // Upload new image
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploaded = (await uploadToCloudinary(buffer, "profiles")) as {
            secure_url: string;
            public_id: string;
          };
          updateData.profileImage = uploaded.secure_url;
          updateData.profileImagePublicId = uploaded.public_id;
          console.log(`Uploaded new image: ${uploaded.secure_url}`);
        }
      }

      // Strip empty fields
      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] === "" ||
          (Array.isArray(updateData[key]) && updateData[key].length === 0)
        ) {
          delete updateData[key];
        }
      });

      // Update user in DB
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true }
      ).lean();

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: "Failed to update user" },
          { status: 500 }
        );
      }

      // Delete old image only AFTER DB update succeeds
      if (oldImagePublicId && updateData.profileImage) {
        try {
          const deletionResult = await deleteFromCloudinary(oldImagePublicId, "image");
          if ((deletionResult as any).result === "ok") {
            console.log(` Deleted old image: ${oldImagePublicId}`);
          } else {
            console.warn(`Failed to delete old image: ${oldImagePublicId}`);
          }
        } catch (err) {
          console.warn("Error deleting old image from Cloudinary:", err);
        }
      }

    
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





