"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, clearUser, setLoading } from "@/redux/slices/authSlice";

export default function useAuthSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // While session is being checked
    if (status === "loading") {
      dispatch(setLoading(true));
      return;
    }

    if (status === "unauthenticated" || !session?.user) {
      dispatch(clearUser());
      return;
    }

    // Mark loading while we fetch profile
    dispatch(setLoading(true));

    // First set a temporary user from session (basic data)
    const baseUser = {
      id: session.user.email ?? "temp-id", // temporary id until DB fetch
      name: session.user.name ?? "",
      email: session.user.email ?? "",
      profileImage: session.user.image ?? undefined,
      accessToken: (session as any).accessToken ?? undefined,
    };

    dispatch(setUser(baseUser));

    // Then fetch full user details from our DB
    fetchCompleteUserData(session.user.email ?? "");
  }, [status, session, dispatch]);

  const fetchCompleteUserData = async (email: string) => {
    try {
      const response = await fetch(`/api/profile/current-user-details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to fetch complete user data:", response.status);
        dispatch(setLoading(false));
        return;
      }

      const result = await response.json();
      const userData = result.data;

      dispatch(
        setUser({
          id: userData._id || userData.id, // prefer DB _id
          name: userData.name,
          email: userData.email,
          profileImage: userData.profileImage,
          username: userData.username,
          bio: userData.bio,
          skills: userData.skills,
          location: userData.location,
          isVerified: userData.isVerified,
          socials: userData.socials,
          projects: userData.projects?.map((p: any) => p.toString()) || [],
          connections: userData.connections?.map((c: any) => c.toString()) || [],
          profileCompleted: userData.profileCompleted,
          lastActive: userData.lastActive,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        
        })
      );
    } catch (error) {
      console.error("Error fetching complete user data:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };
}
