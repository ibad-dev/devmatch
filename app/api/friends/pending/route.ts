import { secureHandler } from "@/middlewares/secureHandler";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FriendRequest from "@/models/FriendRequest";
import dbConnect from "@/lib/db";

export const GET = secureHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  await dbConnect();
  const receiverId = session.user.id;

  const requests = await FriendRequest.find({
    receiver: receiverId,
    status: "pending"
  }).populate("sender", "name email");

  return NextResponse.json({ requests }, { status: 200 });
});
