import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    const { conversationId } = await req.json();

    // Validate conversationId
    if (!conversationId) {
      return new Response(
        JSON.stringify({ message: "conversationId_required" }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: session.user.id } },
      { $push: { readBy: session.user.id } }
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}