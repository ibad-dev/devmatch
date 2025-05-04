import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { secureHandler } from "@/middlewares/secureHandler";

export const GET = secureHandler(async (req: NextRequest) => {
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

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get all projects with owner data
    const projects = await Project.find({ owner: user._id })
      .populate({
        path: 'owner',
        select: 'name profileImage bio skills', // Select specific fields
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    return NextResponse.json(
      { 
        success: true, 
        data: projects.map(project => ({
          ...project,
          owner: {
            id: project.owner._id,
            name: project.owner.name,
            avatar: project.owner.profileImage,
            bio: project.owner.bio,
            skills: project.owner.skills
          }
        }))
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
