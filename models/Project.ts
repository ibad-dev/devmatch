import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
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
