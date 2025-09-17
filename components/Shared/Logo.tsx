import { Code2 } from "lucide-react";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
};

export default function Logo({ href = "/home", className }: LogoProps) {
  return (
    <Link href={href} aria-label="DevMatch home" className={className}>
       <div className="flex items-center gap-x-1.5"><Code2 className="h-8 w-8 text-primary" />
       <span className="text-xl font-bold text-foreground  ">DevMatch</span></div>
    </Link>
  );
}


