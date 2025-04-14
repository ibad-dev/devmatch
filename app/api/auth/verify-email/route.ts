import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { email, otp } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

  
    const isValid = user.verifyOTP(otp);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
