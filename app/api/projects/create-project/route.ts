import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { z } from "zod";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { secureHandler } from "@/middlewares/secureHandler";

// Zod schema for validation
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
      videoUrl: z.string().url().optional(),
      images: z.array(z.string()).optional(),
    })
    .optional(),
});

export const POST = secureHandler(async (req: NextRequest) => {
  await dbConnect();

  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Process form data
    const formData = await req.formData();
    const body: Record<string, any> = Object.fromEntries(formData.entries());

    // Convert string arrays
    ["tags", "techStack", "images"].forEach((key) => {
      if (body[key] && typeof body[key] === "string") {
        body[key] = body[key].split(",");
      }
    });

    // Validate input
    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Handle media uploads
    const media: any = {};
    const files = formData.getAll("files");

    if (files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        if (file instanceof File) {
          // Validate image
          const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
          if (
            !allowedTypes.includes(file.type) ||
            file.size > 5 * 1024 * 1024
          ) {
            throw new Error(`Invalid image: ${file.type}, ${file.size} bytes`);
          }

          const arrayBuffer = await file.arrayBuffer();
          const { secure_url } = (await uploadToCloudinary(
            Buffer.from(arrayBuffer),
            `project`
          )) as { secure_url: string };
          return secure_url;
        }
        return null;
      });

      media.images = (await Promise.all(uploadPromises)).filter(Boolean);
    }

    // Handle video upload
    const videoFile = formData.get("video");
    if (videoFile instanceof File) {
      const videoArrayBuffer = await videoFile.arrayBuffer();
      const { secure_url } = (await uploadToCloudinary(
        Buffer.from(videoArrayBuffer),
        `project/videos`
      )) as { secure_url: string };
      media.videoUrl = secure_url;
    }

    // Create project
    const newProject = await Project.create({
      ...validation.data,
      owner: user._id,
      media: Object.keys(media).length > 0 ? media : undefined,
    });

    // Link project to user
    await User.findByIdAndUpdate(user._id, {
      $push: { projects: newProject._id },
    });

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
