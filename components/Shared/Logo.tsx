import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
};

export default function Logo({ href = "/home", className }: LogoProps) {
  return (
    <Link href={href} aria-label="DevMatch home" className={className}>
      <span className="text-xl font-bold text-foreground ">DevMatch</span>
    </Link>
  );
}


