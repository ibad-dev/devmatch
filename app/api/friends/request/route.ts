import { secureHandler } from "@/middlewares/secureHandler";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FriendRequest from "@/models/FriendRequest";
import dbConnect from "@/lib/db";

export const POST = secureHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { receiverId } = await req.json();

  if (!session?.user || !receiverId) {
    return NextResponse.json({ error: "User not authenticated or receiver missing" }, { status: 400 });
  }

  await dbConnect();
  const senderId = session.user.id;

  if (senderId === receiverId) {
    return NextResponse.json({ error: "You cannot send a request to yourself" }, { status: 400 });
  }

  const existingRequest = await FriendRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId }
    ]
  });

  if (existingRequest) {
    return NextResponse.json({ error: "Friend request already exists" }, { status: 400 });
  }

  const newRequest = new FriendRequest({
    sender: senderId,
    receiver: receiverId
  });
  await newRequest.save();

  return NextResponse.json({ message: "Friend request sent" }, { status: 200 });
});
