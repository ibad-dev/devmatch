import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  tags?: string[];
  techStack?: string[];

  githubUrl?: string;
  liveUrl?: string;

  media?: {
    videoUrl?: string;
    images?: string[]; // URLs of uploaded images
  };

  status?: "draft" | "published";
  likes?: number;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    tags: [{ type: String }],
    techStack: [{ type: String }],

    githubUrl: { type: String },
    liveUrl: { type: String },

    media: {
      videoUrl: { type: String },
      images: [{ type: String }],
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
