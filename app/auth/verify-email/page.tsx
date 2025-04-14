"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const handleVerify = async () => {
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.error || "Verification failed");

      router.push("/auth/signin?verified=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4">
      <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
          Verify Your Email
        </h1>

        <p className="text-center mb-6 text-gray-300">
          We've sent a verification code to {email}
        </p>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="bg-[#222] border-[#333] text-white placeholder-gray-500"
          />

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <Button 
            onClick={handleVerify} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#2563EB] hover:shadow-[0_5px_30px_-5px_rgba(37,99,235,0.3)] transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-5 w-5" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Email"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
