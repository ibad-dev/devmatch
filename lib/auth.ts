import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { env } from "@/config/env";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        if (account?.provider !== "credentials" && existingUser.password) {
          existingUser.profileImage = user.image || existingUser.profileImage;
          existingUser.isVerified = true;
          await existingUser.save();
        }
        return true;
      }

      if (account?.provider !== "credentials") {
        const newUser = new User({
          name: user.name,
          email: user.email,
          profileImage: user.image,
          isVerified: true,
        });
        await newUser.save();
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow reset password page without redirecting to sign-in
      if (url.startsWith(baseUrl + "/auth/reset-password")) {
        return url; // Keep the user on the reset password page
      }
      // Default behavior: redirect to base URL or intended URL
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);