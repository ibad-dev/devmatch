"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const handleError = useCallback((err: unknown) => {
    console.error("Raw error:", err);

    let message = "Something went wrong. Please try again.";

    if (typeof err === "string") {
      message = err;
    } else if (err instanceof Error) {
      message = err.message;
      console.error("Detailed error:", {
        message: err.message,
        stack: err.stack || "No stack trace",
      });
    } else if (err && typeof err === 'object' && 'message' in err) {
      message = (err as { message: string }).message;
    }

    setError(message);
  }, []);

  const onSubmit = useCallback(
    async (data: ForgotPasswordFormData) => {
      setError(null);
      setSuccess(false);
      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        });

        const result = await res.json();
console.log(res)
        if (!res.ok) {
          throw new Error(result?.message || "Failed to send reset link");
        }

        setSuccess(true);
        setTimeout(() => router.push("/auth/signin"), 3000);
      } catch (err) {
        handleError(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, handleError]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] p-4">
      <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
          Forgot Password
        </h1>

        {success && (
          <div
            role="alert"
            className="bg-green-500/20 text-green-400 p-3 rounded-md mb-6 text-center"
          >
            If an account with that email exists, we've sent a reset link.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-red-500/20 text-red-400 p-3 rounded-md mb-6 text-center"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="bg-[#222] border-[#333] text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-red-400 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ed8] hover:from-[#1D4ED8] hover:to-[#2563EB] hover:shadow-[0_5px_30px_-5px_rgba(37,99,235,0.3)] transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-5 w-5" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Reset Password Link"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link href="/auth/signin" className="text-[#2563EB] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
