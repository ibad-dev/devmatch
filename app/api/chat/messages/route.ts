import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

export const dynamic = "force-dynamic";

type Attachment = { url: string; type: string; name?: string; size?: number };

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "unauthorized" }), { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return new Response(JSON.stringify({ message: "conversationId_required" }), { status: 400 });
  }
  await dbConnect();
  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: 1 })
    .lean();

  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: session.user.id } },
    { $addToSet: { readBy: session.user.id } }
  );

  return Response.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "unauthorized" }), { status: 401 });
  }
  const body = await req.json();
  const { conversationId, content, attachments } = body as {
    conversationId: string;
    content?: string;
    attachments?: Attachment[];
  };
  if (!conversationId || (!content && !attachments?.length)) {
    return new Response(JSON.stringify({ message: "bad_request" }), { status: 400 });
  }
  await dbConnect();
  const message = await Message.create({
    conversation: conversationId,
    sender: session.user.id,
    content: content || "",
    attachments: attachments || [],
    readBy: [session.user.id],
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessageAt: new Date(),
    lastMessage: message._id,
  });

  return Response.json(message, { status: 201 });
}