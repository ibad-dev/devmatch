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
      return; // wait until auth status resolves
    }

    // auth resolved
    dispatch(setLoading(false));

    if (status === "authenticated" && session?.user) {
    
      const user = session.user;
      dispatch(
        setUser({
          id: user.id ?? user.email ?? "unknown",
          name: user.name ?? "",
          email: user.email ?? "",
          profileImage: user.image ?? undefined,
        })
      );
    } else {
      dispatch(clearUser());
    }
  }, [status, session, dispatch]);
}
