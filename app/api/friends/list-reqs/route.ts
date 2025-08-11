import { secureHandler } from "@/middlewares/secureHandler";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import FriendRequest from "@/models/FriendRequest";

export const GET = secureHandler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  await dbConnect();
  const userId = session.user.id;

  const reqs = await FriendRequest.find({
    receiver: userId,
    status: "pending",
  })
    .populate("sender", "name email profileImage") // show sender details
    .sort({ createdAt: -1 });

  return NextResponse.json({ requests: reqs }, { status: 200 });
});
