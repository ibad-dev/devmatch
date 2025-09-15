import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { z } from "zod";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { secureHandler } from "@/middlewares/secureHandler";

// Zod schema
const projectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  isCollabrating: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  media: z
    .object({
      video: z
        .object({
          url: z.string().url(),
          publicId: z.string(),
        })
        .optional(),
      images: z
        .array(
          z.object({
            url: z.string().url(),
            publicId: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

// Constants
const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const POST = secureHandler(async (req: NextRequest) => {
  await dbConnect();

  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    
    // Parse formData
    const formData = await req.formData();
 
    const body: Record<string, any> = Object.fromEntries(formData.entries());
    
// Parse JSON arrays from frontend only if it's a string
["tags", "techStack"].forEach((key) => {
  if (body[key]) {
    if (typeof body[key] === "string") {
      try {
        body[key] = JSON.parse(body[key]); 
      } catch {
        body[key] = []; 
      }
    }
  
  }
});

    // Base validation (without media)
    const baseValidation = projectSchema.omit({ media: true }).safeParse(body);
    if (!baseValidation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: baseValidation.error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle media uploads
    const media: { images: { url: string; publicId: string }[]; video?: { url: string; publicId: string } } = {
      images: [],
    };

    // Images
    const imageFiles = formData.getAll("images");
    if (imageFiles.length > 0) {
      if (imageFiles.length > MAX_IMAGES) {
        return NextResponse.json({ success: false, message: `Maximum ${MAX_IMAGES} images allowed` }, { status: 400 });
      }

      try {
        const uploadPromises = imageFiles.map(async (file) => {
          if (!(file instanceof File)) return null;

          if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error(`Invalid image type: ${file.type}`);
          }
          if (file.size > MAX_IMAGE_SIZE) {
            throw new Error(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          const { secure_url, public_id } = (await uploadToCloudinary(buffer, "projects/images")) as { secure_url: string; public_id: string };
          return { url: secure_url, publicId: public_id };
        });

        media.images = (await Promise.all(uploadPromises)).filter(Boolean) as { url: string; publicId: string }[];
      } catch (error) {
        return NextResponse.json(
          { success: false, message: error instanceof Error ? error.message : "Image upload failed" },
          { status: 400 }
        );
      }
    }

    // Video
    const videoFile = formData.get("video");
    
    if (videoFile instanceof File) {
      if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
        return NextResponse.json({ success: false, message: `Invalid video type: ${videoFile.type}` }, { status: 400 });
      }
      if (videoFile.size > MAX_VIDEO_SIZE) {
        return NextResponse.json({ success: false, message: `Video size exceeds ${MAX_VIDEO_SIZE / (1024 * 1024)}MB` }, { status: 400 });
      }

      try {
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        const { secure_url, public_id } = (await uploadToCloudinary(buffer, "projects/videos")) as { secure_url: string; public_id: string };
        media.video = { url: secure_url, publicId: public_id };
      } catch {
        return NextResponse.json({ success: false, message: "Video upload failed" }, { status: 400 });
      }
    }

    // Final data
    const finalData = {
      ...baseValidation.data,
      owner: user._id,
      media: (media.images.length > 0 || media.video) ? media : undefined,
    };

    // Validate final structure (with media)
    const finalValidation = projectSchema.safeParse(finalData);
    if (!finalValidation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid media input",
          errors: finalValidation.error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Create project (use finalData to include required owner field)
    const newProject = await Project.create(finalData);

    // Link to user
    user.projects.push(newProject._id);
    await user.save();

    return NextResponse.json(
      { success: true, message: "Project created successfully", data: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
});
