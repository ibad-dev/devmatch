import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { secureHandler } from "@/middlewares/secureHandler";

export const DELETE = secureHandler(async (req: NextRequest) => {
  await dbConnect();
  const projectId = req.nextUrl.pathname.split("/").pop();

  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
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

    // Find and verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: user._id,
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to perform this action",
        },
        { status: 403 }
      );
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    // Remove project reference from user
    await User.findByIdAndUpdate(user._id, {
      $pull: { projects: projectId },
    });

    return NextResponse.json(
      { success: true, message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
