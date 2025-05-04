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
      return NextResponse.json(
        {
          success: true,
          message: "Current User Data Retrieved Successfully",
          data: user,
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
