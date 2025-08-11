  import { NextResponse } from "next/server";
  import User from "@/models/User";
  import { sendResetPasswordEmail } from "@/lib/email";
  import { env } from "@/config/env";
  import dbConnect from "@/lib/db";
  import crypto from "crypto";
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

// ===== RESET PASSWORD =====
export async function PATCH(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
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
    });

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