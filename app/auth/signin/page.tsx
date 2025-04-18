"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    register,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });

  const handleEmailLogin = useCallback(
    async (data: SignInFormData) => {
      setError(null);
      setSuccess(false);

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      } else {
        setSuccess(true);
        router.push("/profile");
      }
    },
    [router]
  );

  const handleOAuth = useCallback(async (provider: "google" | "github") => {
    setLoadingOAuth(provider);
    setError(null);
    try {
      const result = await signIn(provider, {
        callbackUrl: "/profile",
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No redirect URL provided");
      }
    } catch (err) {
      setError(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in failed`
      );
      setLoadingOAuth(null);
    }
  }, []);

  // Clean up OAuth loading state on unmount
  useEffect(() => {
    return () => {
      setLoadingOAuth(null);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4">
      <div className="bg-[#1a1a1a] text-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
        {/* Logo and Header */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/devmatch-bg-none.png"
            alt="DevMatch Logo"
            width={120}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
          Sign In to DevMatch
        </h1>

        {/* Status Messages */}
        {success && (
          <div className="animate-fade-in bg-green-500/20 text-green-400 p-3 rounded-md mb-6 text-center">
            Sign-in successful! Redirecting...
          </div>
        )}
        {error && (
          <div className="animate-fade-in bg-red-500/20 text-red-400 p-3 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form
          onSubmit={handleSubmit(handleEmailLogin)}
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
              autoFocus
              {...register("email", {
                onBlur: () => trigger("email"),
                onChange: () => {
                  setError(null);
                  trigger("email");
                },
              })}
              className="bg-[#222] border-[#333] text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              onFocus={(e) => isSubmitting && e.target.blur()}
            />
            {errors.email && (
              <span className="text-red-400 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password", {
                  onBlur: () => trigger("password"),
                  onChange: () => {
                    setError(null);
                    trigger("password");
                  },
                })}
                className="bg-[#222] border-[#333] text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-[#2563EB] pr-12"
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
                onFocus={(e) => isSubmitting && e.target.blur()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm hover:text-gray-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isSubmitting}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-400 text-sm">
                {errors.password.message}
              </span>
            )}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#2563EB] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#2563EB] hover:shadow-[0_5px_30px_-5px_rgba(37,99,235,0.3)] transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-5 w-5" />
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-[#2563EB] hover:underline transition-all"
          >
            Register here
          </Link>
        </p>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#333]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-[#1a1a1a] text-gray-400 text-sm">
              or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          {(["google", "github"] as const).map((provider) => (
            <Button
              key={provider}
              type="button"
              onClick={() => handleOAuth(provider)}
              variant="outline"
              className="w-full gap-3 bg-[#222] border-[#333] hover:bg-[#333] text-white transition-colors"
              disabled={!!loadingOAuth}
            >
              {loadingOAuth === provider ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-5 w-5" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  {provider === "google" ? (
                    <GoogleIcon className="w-5 h-5" />
                  ) : (
                    <GitHubIcon className="w-5 h-5" />
                  )}
                  <span>
                    Sign In with{" "}
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </span>
                </>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
// Keep the same icon components
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.9 3.28-4.7 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0C5.37 0 0 5.37 0 12c0 5.25 3.438 9.708 8.207 11.287.6.111.793-.261.793-.577v-2.115c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.237-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.237 1.91 1.237 3.221 0 4.606-2.8 5.623-5.487 5.923.428.367.81 1.093.81 2.196v3.248c0 .319.193.692.8.576A11.935 11.935 0 0024 12c0-6.63-5.37-12-12-12z"
    />
  </svg>
);
