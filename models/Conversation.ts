import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IConversation extends Document {
  isGroup: boolean;
  name?: string;
  participants: mongoose.Types.ObjectId[];
  lastMessageAt?: Date;
  lastMessage?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
    ],
    lastMessageAt: { type: Date },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true }
);

// Ensure no duplicate 1:1 conversations
ConversationSchema.index(
  { participants: 1, isGroup: 1,lastMessageAt: -1  },
  
  {
    unique: true,
    partialFilterExpression: { isGroup: false },
  }
);

const Conversation =
  models.Conversation ||
  model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
