import { cn } from "@/lib/utils"; // Assuming you're using shadcn/ui's cn utility

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-600",
        sizeClasses[size],
        className
      )}
    />
  );
}