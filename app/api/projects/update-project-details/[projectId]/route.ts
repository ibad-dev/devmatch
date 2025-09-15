import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { secureHandler } from "@/middlewares/secureHandler";

// File constraints   
const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const projectSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  status: z.enum(["draft", "published"]).optional(),
  
});

export const PUT = secureHandler(async (req: NextRequest) => {
  await dbConnect();

  try {
    //  Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    //  Extract projectId from URL
    const projectId = req.nextUrl.pathname.split("/").pop();
    if (!projectId) {
      return NextResponse.json({ success: false, message: "Project ID is required" }, { status: 400 });
    }

    // Check user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Check project ownership
    const project = await Project.findOne({ _id: projectId, owner: user._id });
    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found or unauthorized" }, { status: 404 });
    }

    //  Parse formData
    const formData = await req.formData();
    const body: Record<string, any> = Object.fromEntries(formData.entries());

    // Convert arrays if sent as JSON strings
    ["tags", "techStack"].forEach((key) => {
      if (body[key] && typeof body[key] === "string") {
        try {
          body[key] = JSON.parse(body[key]);
        } catch {
          body[key] = [];
        }
      }
    });

    // Validate base fields
    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = { ...validation.data };

 
    //  Handle Images

    let finalImages: { url: string; publicId: string }[] = (project.media?.images as any) || [];

    // Only process if frontend sent something
    if (formData.has("keptImages") || formData.has("newImages")) {
      // Parse kept images
      let keptImages: { url: string; publicId: string }[] = [];
      if (formData.has("keptImages")) {
        try {
          const raw = formData.get("keptImages");
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (Array.isArray(parsed)) {
            keptImages = parsed
              .filter(Boolean)
              .map((i: any) => ({ url: String(i.url || ""), publicId: String(i.publicId || "") }))
              .filter((i) => i.url && i.publicId);
          }
        } catch {
          keptImages = [];
        }
      }

      // Upload new images
      const newImageFiles = formData.getAll("newImages");
      const uploadedImages: { url: string; publicId: string }[] = [];
      if (newImageFiles.length > 0) {
        if (newImageFiles.length + keptImages.length > MAX_IMAGES) {
          return NextResponse.json(
            { success: false, message: `Maximum ${MAX_IMAGES} images allowed` },
            { status: 400 }
          );
        }

        const uploadPromises = newImageFiles.map(async (file) => {
          if (file instanceof File) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error(`Invalid image type: ${file.type}`);
            if (file.size > MAX_IMAGE_SIZE) throw new Error(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
            const buffer = Buffer.from(await file.arrayBuffer());
            const { secure_url, public_id } = (await uploadToCloudinary(buffer, "projects/images")) as {
              secure_url: string;
              public_id: string;
            };
            return { url: secure_url, publicId: public_id };
          }
          return null;
        });
        finalImages = [
          ...keptImages,
          ...(((await Promise.all(uploadPromises)).filter(Boolean)) as { url: string; publicId: string }[]),
        ];
      } else {
        finalImages = [...keptImages];
      }

      // Delete removed images
      const oldImages = (project.media?.images as { url: string; publicId: string }[]) || [];
      const removedImages = oldImages.filter(
        (oldImg) => !keptImages.some((keepImg) => keepImg.publicId === oldImg.publicId)
      );
      for (const img of removedImages) {
        try {
          await deleteFromCloudinary(img.publicId, "image");
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      }
    }

  
    // Handle Video
   
    if (formData.has("video")) {
      const videoFile = formData.get("video");
      if (videoFile instanceof File) {
        // if a video already exists, ask user to delete first
        if ((project.media as any)?.video) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Only one video is allowed per project. Please delete the existing video first, then upload a new one.",
            },
            { status: 400 }
          );
        }
        // Validate video type and size
        if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
          return NextResponse.json(
            { success: false, message: `Invalid video type: ${videoFile.type}` },
            { status: 400 }
          );
        }
        if (videoFile.size > MAX_VIDEO_SIZE) {
          return NextResponse.json(
            { success: false, message: `Video size exceeds ${MAX_VIDEO_SIZE / (1024 * 1024)}MB` },
            { status: 400 }
          );
        }
        // Upload new video
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        const { secure_url, public_id } = (await uploadToCloudinary(
          buffer,
          "projects/videos"
        )) as { secure_url: string; public_id: string };
        updateData.media = {
          ...updateData.media,
          images: finalImages,
          video: { url: secure_url, publicId: public_id },
        };
      }
    } else {
      // No new video uploaded → keep old video
      updateData.media = {
        ...updateData.media,
        images: finalImages,
        video: project.media?.video,
      };
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true });

    return NextResponse.json({ success: true, data: updatedProject }, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
});
