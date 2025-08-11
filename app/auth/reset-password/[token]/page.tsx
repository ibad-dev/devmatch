"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = decodeURIComponent(params.token);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111] p-4">
        <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
            Invalid Token
          </h1>
          <p className="text-center text-gray-400 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push("/auth/forgot-password")}
          >
            Request a new password link
          </Button>
        </div>
      </div>
    );
  }

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      if (!token) {
        setError("Invalid reset token");
        return;
      }

      setError(null);
      setSuccess(false);
      setIsSubmitting(true);

      try {
        const res = await fetch(`/api/auth/reset-password/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: data.password,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result?.message || "Failed to reset password");
        }

        setSuccess(true);
        setTimeout(() => router.push("/auth/signin"), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] p-4">
      <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
          Reset Password
        </h1>

        {success && (
          <div
            role="alert"
            className="bg-green-500/20 text-green-400 p-3 rounded-md mb-6 text-center"
          >
            Password reset successfully! Redirecting to login...
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
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              New Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="bg-[#222] border-[#333] text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              {...register("password")}
            />
            {errors.password && (
              <span className="text-red-400 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-300"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className="bg-[#222] border-[#333] text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className="text-red-400 text-sm">
                {errors.confirmPassword.message}
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
                <span>Resetting...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-sm text-gray-400 hover:text-gray-200"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Request a new password link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


