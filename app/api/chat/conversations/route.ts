import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "unauthorized" }), {
        status: 401,
      });
    }

    const body = await req.json();
    const { participantIds, isGroup, name } = body as {
      participantIds: string[];
      isGroup?: boolean;
      name?: string;
    };

    // Validate participantIds
    if (!participantIds || participantIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "participants_required" }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Ensure participantIds are valid user IDs
    const validParticipants = await User.find({
      _id: { $in: participantIds },
    }).select("_id");

    if (validParticipants.length !== participantIds.length) {
      return new Response(JSON.stringify({ message: "invalid_participants" }), {
        status: 400,
      });
    }

    // Create conversation
    const uniqueParticipantIds = Array.from(
      new Set([session.user.id, ...participantIds])
    );

    const conversation = await Conversation.findOneAndUpdate(
      { participants: { $all: uniqueParticipantIds }, isGroup: false }, // Query
      {
        $setOnInsert: {
          isGroup: Boolean(isGroup) && uniqueParticipantIds.length > 2,
          name: name || undefined,
          participants: uniqueParticipantIds,
          lastMessageAt: new Date(),
        },
      }, // Update
      { upsert: true, new: true } // Options
    );

    // Populate participant details in the response
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email")
      .lean();

    return Response.json(populatedConversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}

// Delete a conversation
export async function DELETE(req: NextRequest) {
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
        JSON.stringify({ message: "conversation_id_required" }),
        {
          status: 400,
        }
      );
    }

    await dbConnect();

    // Delete the conversation if the user is a participant
    const deletedConversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      participants: session.user.id,
    });

    if (!deletedConversation) {
      return new Response(
        JSON.stringify({ message: "conversation_not_found" }),
        {
          status: 404,
        }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return new Response(JSON.stringify({ message: "internal_server_error" }), {
      status: 500,
    });
  }
}
