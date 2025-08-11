import { secureHandler } from "@/middlewares/secureHandler";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FriendRequest from "@/models/FriendRequest";
import dbConnect from "@/lib/db";

export const PATCH = secureHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { senderId } = await req.json();

  if (!session?.user || !senderId) {
    return NextResponse.json(
      { error: "Sender ID is required" },
      { status: 400 }
    );
  }

  await dbConnect();

  const receiverId = session.user.id;

  const deleted = await FriendRequest.findOneAndDelete({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (!deleted) {
    return NextResponse.json(
      { error: "Friend request not found or already handled" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { message: "Friend request rejected and removed" },
    { status: 200 }
  );
});
