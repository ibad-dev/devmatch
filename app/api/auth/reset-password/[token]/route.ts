
import { NextResponse } from "next/server";
import User from "@/models/User";
import crypto from "crypto";
import dbConnect from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    await dbConnect();

    
    const token = decodeURIComponent(params.token);
    const { password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid token or token has expired" },
        { status: 400 }
      );
    }


    user.password = password; 
    user.clearResetToken();
    await user.save();

    console.log(`Password reset successful for user: ${user.email}`);

    return NextResponse.json({
      status: "success",
      message: "Password has been reset successfully!",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
