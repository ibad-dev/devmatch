import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  attachments?: { url: string; type: string; name?: string; size?: number }[];
  readBy: mongoose.Types.ObjectId[];
  status: "sent" | "delivered" | "read"; 
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, default: "" },
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true },
        name: { type: String },
        size: { type: Number },
      },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);


MessageSchema.index({ conversation: 1, createdAt: -1 });

const Message = models.Message || model<IMessage>("Message", MessageSchema);
export default Message;
