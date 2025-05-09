import { NextResponse } from "next/server";
import User from "@/models/User";
import { sendResetPasswordEmail } from "@/lib/email";
import { env } from "@/config/env";
import dbConnect from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "No account found with that email address." },
        { status: 404 }
      );
    }

    const resetToken = user.generateResetToken();
    await user.save();

    // Use a proper domain in production
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://yourdomain.com" // Replace with your production domain
        : "http://localhost:3000";

    // Use query parameter instead of path parameter
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Verify the URL structure
    if (!resetUrl.includes("token=")) {
      throw new Error("Invalid reset URL structure");
    }

    await sendResetPasswordEmail({
      email: user.email,
      resetUrl,
    });

    return NextResponse.json(
      {
        message:
          "Password reset email sent successfully. Please check your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      {
        message:
          "Failed to process password reset request. Please try again later.",
        error:
          process.env.NODE_ENV === "development"
            ? (error as { message: string }).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
