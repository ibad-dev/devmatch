import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type Attachment = { url: string; type: string; name?: string; size?: number };

// Fetch messages for a specific conversation
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!conversationId) {
      return new Response(
        JSON.stringify({ message: "conversationId_required" }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Ensure the user is a participant in the conversation
    const conversation = await Conversation.findById(conversationId).lean<{
      participants: string[]; // Array of participant IDs
    }>();

    if (!conversation) {
      return new Response(
        JSON.stringify({ message: "conversation_not_found" }),
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === session.user.id
    );
    if (!isParticipant) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    // Fetch messages with pagination
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return Response.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}

// Send a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    const body = await req.json();
    const { conversationId, content, attachments } = body;

    if (!conversationId || !content) {
      return new Response(
        JSON.stringify({ message: "conversationId_and_content_required" }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Ensure the user is a participant in the conversation
    const conversation = await Conversation.findById(conversationId).lean<{
      participants: string[]; // Array of participant IDs
    }>();

    if (!conversation) {
      return new Response(
        JSON.stringify({ message: "conversation_not_found" }),
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === session.user.id
    );
    if (!isParticipant) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    // Use a transaction for atomicity
    const dbSession = await mongoose.startSession(); // Renamed to avoid conflict
    dbSession.startTransaction();
    try {
      const message = await Message.create(
        [
          {
            conversation: conversationId,
            sender: session.user.id,
            content,
            attachments,
          },
        ],
        { session: dbSession }
      );

      await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: message[0]._id, lastMessageAt: new Date() },
        { session: dbSession }
      );

      await dbSession.commitTransaction();
      return Response.json(message[0], { status: 201 });
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    const { messageId, status } = await req.json();

    if (!messageId || !status) {
      return new Response(
        JSON.stringify({ message: "messageId_and_status_required" }),
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    if (!updatedMessage) {
      return new Response(JSON.stringify({ message: "message_not_found" }), {
        status: 404,
      });
    }

    return Response.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message status:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}

export async function DELETE(req: NextRequest) {
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

    const deletedMessage = await Message.findOneAndDelete({
      _id: messageId,
      sender: session.user.id, // Ensure the user is the sender
    });

    if (!deletedMessage) {
      return new Response(JSON.stringify({ message: "message_not_found" }), {
        status: 404,
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}
