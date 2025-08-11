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

  const friends = await FriendRequest.find({
    status: "accepted",
    $or: [
      { sender: userId },
      { receiver: userId },
    ],
  })
    .populate("sender", "name email profileImage")
    .populate("receiver", "name email profileImage");

  const friendList = friends.map(req =>
    req.sender._id.toString() === userId ? req.receiver : req.sender
  );

  return NextResponse.json({ friends: friendList }, { status: 200 });
});
