import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { secureHandler } from "@/middlewares/secureHandler";

const projectSchema = z.object({
  title: z.string().min(3).max(50).optional(),
  description: z.string().min(10).max(2000).optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  status: z.enum(["draft", "published"]).optional(),
  media: z
    .object({
      videoUrl: z.string().url().optional(),
      images: z.array(z.string()).optional(),
    })
    .optional(),
});

export const PUT = secureHandler(async (req: NextRequest) => {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const projectId = req.nextUrl.pathname.split("/").pop();
    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const project = await Project.findOne({ _id: projectId, owner: user._id });
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const body: Record<string, any> = Object.fromEntries(formData.entries());

    ["tags", "techStack", "images"].forEach((key) => {
      if (body[key] && typeof body[key] === "string") {
        body[key] = body[key].split(",");
      }
    });

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

    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(validation.data)) {
      if (value !== undefined) updateData[key] = value;
    }

    const media: Record<string, any> = {};

    // Handle image updates
    if (formData.has("files") || formData.has("existingImages")) {
      const existingImages = formData.get("existingImages")?.toString().split(",") || [];
      const files = formData.getAll("files");
      const currentImages = project.media?.images || [];

      const imagesToDelete = currentImages.filter(
        (image: string) => !existingImages.includes(image)
      );

      const newImages: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            const { secure_url } = (await uploadToCloudinary(
              Buffer.from(arrayBuffer),
              `project`
            )) as { secure_url: string };
            return secure_url;
          }
          return null;
        });

        newImages.push(...(await Promise.all(uploadPromises)).filter((url): url is string => url !== null));
      }

      media.images = [...existingImages, ...newImages];

      for (const imageUrl of imagesToDelete) {
        try {
          const url = new URL(imageUrl);
          const pathname = url.pathname;
          const publicIdMatch = pathname.match(/\/(?:image|video|raw)\/(?:upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/(?:v\d+\/)?(.+?)(?:\.[^\/\.]+)?$/);
          if (publicIdMatch?.[1]) {
            await deleteFromCloudinary(publicIdMatch[1], "image");
          }
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
    }

    // Handle video update
    if (formData.has("video")) {
      const videoFile = formData.get("video");
      if (videoFile instanceof File) {
        const videoArrayBuffer = await videoFile.arrayBuffer();
        const { secure_url } = (await uploadToCloudinary(
          Buffer.from(videoArrayBuffer),
          `project/videos`
        )) as { secure_url: string };
        media.videoUrl = secure_url;
      }
    }

    if (Object.keys(media).length > 0) {
      updateData.media = {
        ...project.media,
        ...media,
      };
    }

    if (Object.keys(updateData).length > 0) {
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true }
      );
      return NextResponse.json(
        { success: true, data: updatedProject },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: "No changes detected", data: project },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
