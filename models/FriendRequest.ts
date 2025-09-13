import mongoose, { Schema, model, models, Document } from "mongoose";

interface FriendRequest extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    status: "pending" | "accepted" 
}

const FriendRequestSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
    },

}   ,{timestamps: true}); 
FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const FriendRequest = models.FriendRequest || model<FriendRequest>("FriendRequest", FriendRequestSchema);

export default FriendRequest;
