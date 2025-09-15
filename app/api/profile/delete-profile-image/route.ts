import { authOptions } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import dbConnect from "@/lib/db";
import { secureHandler } from "@/middlewares/secureHandler";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = secureHandler(async (req: NextRequest) => {
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
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    if (!user.profileImage || !user.profileImagePublicId) {
      return NextResponse.json(
        { success: false, message: "No profile image to delete" },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(user.profileImagePublicId, "image");

    // Clear fields in DB
    user.profileImage = null;
    user.profileImagePublicId = null;
    await user.save();
    return NextResponse.json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.log("ERROR TO DEL PFP", error);
    return NextResponse.json(
      { success: false, message: "Error to delete pfp" },
      { status: 400 }
    );
  }
});
  