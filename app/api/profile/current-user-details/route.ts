import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { secureHandler } from "@/middlewares/secureHandler";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = secureHandler(
  async (req: NextRequest): Promise<NextResponse> => {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
      
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found!" },
          { status: 404 }
        );
      }

      // Convert Mongoose document to plain object and handle ObjectIds
      const userData = user.toObject();
      
      // Convert ObjectIds to strings for arrays
      if (userData.projects) {
        userData.projects = userData.projects.map((id: any) => id.toString());
      }
      if (userData.connections) {
        userData.connections = userData.connections.map((id: any) => id.toString());
      }
   
      return NextResponse.json(
        {
          success: true,
          message: "Current User Data Retrieved Successfully",
          data: userData,
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      console.error("Error in current-user-details:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
