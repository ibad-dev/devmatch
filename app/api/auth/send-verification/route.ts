import { NextResponse } from "next/server";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { name, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create temporary user with verification data
    const user = new User({
      name,
      email,
      password,
      isVerified: false,
    });

    // Generate and save OTP
    const otp = user.generateVerificationOTP();
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send verification" },
      { status: 500 }
    );
  }
}
