import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { secureHandler } from "@/middlewares/secureHandler";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export const DELETE = secureHandler(async (req: NextRequest) => {
  await dbConnect();

  try {
    //  Authentication

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Extract projectId
  
    const projectId = req.nextUrl.pathname.split("/").pop();
    if (!projectId) {
      return NextResponse.json({ success: false, message: "Project ID is required" }, { status: 400 });
    }

    // ✅ Find user

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }


    // ✅ Find project and check ownership

    const project = await Project.findOne({ _id: projectId, owner: user._id });
    if (!project) {
      return NextResponse.json({ success: false, message: "You are not authorized to perform this action" }, { status: 403 });
    }

   
    // ✅ Delete media from Cloudinary

    try {
      const images = project.media?.images || [];
      const videoPublicId = project.media?.video?.publicId;

      const imageDeletions = images.map((img: any) =>
        deleteFromCloudinary(img.publicId, "image")
      );

      const videoDeletion = videoPublicId
        ? deleteFromCloudinary(videoPublicId, "video")
        : Promise.resolve();

      // Wait for all deletions to finish
      await Promise.all([...imageDeletions, videoDeletion]);
    } catch (err) {
      console.error("Error deleting media from Cloudinary:", err);
      throw new Error("Failed to delete project media");
    }

  
    // Delete project from DB
    
    await Project.findByIdAndDelete(projectId);

    // Remove project reference from user
    
    await User.findByIdAndUpdate(user._id, { $pull: { projects: projectId } });

   
    //  Return success response
    
    return NextResponse.json({ success: true, message: "Project deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
});
