import mongoose, { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  profileImage?: string;
  password?: string;
  username?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  isVerified: boolean;
  verificationOTP?: string;
  verificationExpiry?: Date;
  resetToken?: string; // New field for password reset token
  resetTokenExpiry?: Date; // New field for password reset token expiration

  socials?: {
    github?: string;
    linkedin?: string;
    X?: string;
    portfolio?: string;
  };

  projects?: mongoose.Types.ObjectId[];
  connections?: mongoose.Types.ObjectId[];
  communities?: mongoose.Types.ObjectId[];

  profileCompleted?: boolean;
  lastActive?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, index: true, required: true },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: { type: String , select:false},
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    verificationExpiry: { type: Date },
    username: {
      type: String,
      unique: true,
      sparse: true,
      minlength: [3, "Too short"],
      maxlength: [30, "Too long"],
    },
    bio: { type: String },
    skills: [{ type: String, default: [] }],
    location: { type: String },

    socials: {
      github: { type: String },
      linkedin: { type: String },
      X: { type: String },
      portfolio: { type: String },
    },

    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],

    profileCompleted: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },

    // New fields for password reset
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// compare password from db to user entered password
UserSchema.methods.comparePassword = async function (
  userPassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(userPassword, this.password);
};

// Add these new methods
UserSchema.methods.generateVerificationOTP = function (): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationOTP = otp;
  this.verificationOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

UserSchema.methods.verifyOTP = function (otp: string): boolean {
  if (this.verificationOTP === otp && this.verificationExpiry > new Date()) {
    this.isVerified = true;
    this.verificationOTP = undefined;
    this.verificationExpiry = undefined;
    return true;
  }
  return false;
};

// Methods for password reset
UserSchema.methods.generateResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000);
  return resetToken;
};

UserSchema.methods.validateResetToken = function (token: string): boolean {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return this.resetToken === hashedToken && this.resetTokenExpiry > new Date();
};

// Add a method to clear reset token after use
UserSchema.methods.clearResetToken = function (): void {
  this.resetToken = undefined;
  this.resetTokenExpiry = undefined;
};

const User = models.User || model<IUser>("User", UserSchema);

export default User;
