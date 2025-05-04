import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { secureHandler } from "@/middlewares/secureHandler";

export const GET = secureHandler(async (req: NextRequest) => {
  await dbConnect();
  const projectId = new URL(req.url).pathname.split("/").pop();

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

    // Find project and populate owner data
    const project = (await Project.findOne({ _id: projectId })
      .populate<{
        owner: {
          _id: string;
          name: string;
          profileImage: string;
          bio: string;
          skills: string[];
        };
      }>({
        path: "owner",
        select: "name profileImage bio skills",
      })
      .lean()) as unknown as {
      owner: {
        _id: string;
        name: string;
        profileImage: string;
        bio: string;
        skills: string[];
      };
    };

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Format response
    const formattedProject = {
      ...project,
      owner: {
        id: project.owner._id,
        name: project.owner.name,
        avatar: project.owner.profileImage,
        bio: project.owner.bio,
        skills: project.owner.skills,
      },
    };

    return NextResponse.json(
      { success: true, data: formattedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
