"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, clearUser, setLoading } from "@/redux/slices/authSlice";

export default function useAuthSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "loading") {
      dispatch(setLoading(true));
      return;
    }

    dispatch(setLoading(false));

    if (status === "authenticated" && session?.user) {
      // First set basic user data from session
      const user = session.user;
      dispatch(
        setUser({
          id: user.id ?? user.email ?? "unknown",
          name: user.name ?? "",
          email: user.email ?? "",
          profileImage: user.image ?? undefined,
        })
      );

      // Then fetch complete user data from database
      fetchCompleteUserData(user.email ?? "");
    } else {
      dispatch(clearUser());
    }
  }, [status, session, dispatch]);

  const fetchCompleteUserData = async (email: string) => {
    try {
      const response = await fetch(`/api/profile/current-user-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.data;
        
        // Update Redux with complete user data including all fields
        dispatch(
          setUser({
            id: userData._id || userData.id,
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
      }
    } catch (error) {
      console.error('Error fetching complete user data:', error);
    }
  };
}
