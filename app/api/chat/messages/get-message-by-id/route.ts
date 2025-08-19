import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

export const dynamic = "force-dynamic";

// Fetch details of a specific message
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return new Response(JSON.stringify({ message: "messageId_required" }), {
        status: 400,
      });
    }

    await dbConnect();

    const message = await Message.findById(messageId)
      .populate("sender", "name email") // Optionally populate sender details
      .populate({
        path: "conversation",
        select: "participants", // Only fetch participants for authorization
      })
      .lean<{
        conversation: { participants: string[] }; // Explicitly define the type
      }>();

    // Check if message is null
    if (!message) {
      return new Response(JSON.stringify({ message: "message_not_found" }), {
        status: 404,
      });
    }

    // Check if the user is a participant in the conversation
    const isParticipant = message.conversation.participants.some(
      (participant) => participant.toString() === session.user.id
    );

    if (!isParticipant) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    // Return the full message
    return Response.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}
