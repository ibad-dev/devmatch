"use client";

import React from "react";
import useAuthSync from "@/hooks/useAuthSync";

export default function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  useAuthSync(); // runs the sync hook on the client
  return <>{children}</>;
}
