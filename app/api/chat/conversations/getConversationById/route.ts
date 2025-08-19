import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";

export const dynamic = "force-dynamic";

// Fetch details of a specific conversation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new Response(
        JSON.stringify({ message: "Conversation Id required" }),
        {
          status: 400,
        }
      );
    }

    await dbConnect();

    // Fetch conversation details
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "name email profileImage")
      .populate("lastMessage")
      .lean<{
        participants: { _id: string; name: string; email: string , profileImage:string}[];
        lastMessage?: {
          _id: string;
          content: string;
          sender: string;
          createdAt: Date;
        };
      }>();

    if (!conversation) {
      return new Response(
        JSON.stringify({ message: "Conversation Not Found" }),
        {
          status: 404,
        }
      );
    }

    // Ensure the user is a participant in the conversation
    const isParticipant = conversation.participants.some(
      (participant) => participant._id.toString() === session.user.id
    );

    if (!isParticipant) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    return Response.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}
