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
    if (!user.profileImage) {
      return NextResponse.json(
        { success: false, message: "There is no profile Image to delete" },
        { status: 404 }
      );
    }
    let oldImagePublicId: string | null = null;
    try {
      const url = user.profileImage;
      const parts = url.split("/upload/");
      if (parts.length === 2) {
        let path = parts[1];
        // Remove version number (e.g., v1746367572) if present
        const versionMatch = path.match(/^v\d+\//);
        if (versionMatch) {
          path = path.slice(versionMatch[0].length); // Remove v123.../
        }
        const publicId = path.split(".")[0]; // Remove file extension
        oldImagePublicId = publicId; // e.g., profiles/image123
        console.log(`Extracted old public ID: ${oldImagePublicId}`);
      } else {
        console.warn(`Invalid Cloudinary URL format: ${url}`);
      }
    } catch (err) {
      console.warn("Failed to extract public ID from URL:", err);
    }
    try {
      const deletionResult = await deleteFromCloudinary(
        oldImagePublicId!,
        "image"
      );
      if (deletionResult.result === "ok") {
        console.log(
          `Successfully deleted old image with public ID: ${oldImagePublicId}`
        );
        // Update user in database to remove profile image
        user.profileImage = null;
        await user.save();
      } else {
        console.warn(
          `Failed to delete old image with public ID ${oldImagePublicId}. Result:`,
          deletionResult
        );
        return NextResponse.json(
          { success: false, message: "Failed to delete image from Cloudinary" },
          { status: 500 }
        );
      }
    } catch (err) {
      console.warn("Error deleting old image from Cloudinary:", err);
      return NextResponse.json(
        { success: false, message: "Error deleting image" },
        { status: 500 }
      );
    }
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
