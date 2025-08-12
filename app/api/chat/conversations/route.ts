import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "unauthorized" }), { status: 401 });
  }
  await dbConnect();
  const conversations = await Conversation.find({
    participants: session.user.id,
  })
    .sort({ updatedAt: -1 })
    .lean();

  return Response.json(conversations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "unauthorized" }), { status: 401 });
  }

  const body = await req.json();
  const { participantIds, isGroup, name } = body as {
    participantIds: string[];
    isGroup?: boolean;
    name?: string;
  };

  if (!participantIds || participantIds.length === 0) {
    return new Response(JSON.stringify({ message: "participants_required" }), { status: 400 });
  }

  await dbConnect();
  const uniqueParticipantIds = Array.from(new Set([session.user.id, ...participantIds]));

  const conversation = await Conversation.create({
    isGroup: Boolean(isGroup) && uniqueParticipantIds.length > 2,
    name: name || undefined,
    participants: uniqueParticipantIds,
    lastMessageAt: new Date(),
  });

  return Response.json(conversation, { status: 201 });
}