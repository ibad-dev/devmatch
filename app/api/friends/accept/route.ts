import { secureHandler } from "@/middlewares/secureHandler";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export const PATCH = secureHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { senderId } = await req.json(); // sender of the original request

  if (!session?.user || !senderId) {
    return NextResponse.json({ error: "User not authenticated or sender missing" }, { status: 400 });
  }

  await dbConnect();
  const receiverId = session.user.id;

  const request = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    status: "pending"
  });

  if (!request) {
    return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
  }

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(senderId, { $addToSet: { friends: receiverId } });
  await User.findByIdAndUpdate(receiverId, { $addToSet: { friends: senderId } });

  return NextResponse.json({ message: "Friend request accepted" }, { status: 200 });
});
