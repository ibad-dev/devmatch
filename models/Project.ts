import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  tags?: string[];
  techStack?: string[];
  isCollabrating: boolean;
  githubUrl?: string;
  liveUrl?: string;
  collabrators?: mongoose.Types.ObjectId[];
  media: {
    video?: {
      url: string;
      publicId: string;
    };
    images: {
      url: string;
      publicId: string;
    }[];
  };
  status?: "draft" | "published";
  likes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tags: [{ type: String }],
    techStack: [{ type: String }],
    isCollabrating: { type: Boolean, default: false },
    githubUrl: { type: String },
    liveUrl: { type: String },
    collabrators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    media: {
      video: {
        url: { type: String },
        publicId: { type: String }
      },
      images: [{
        url: { type: String },
        publicId: { type: String }
      }],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    likes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Project = models.Project || model<IProject>("Project", ProjectSchema);
export default Project;
