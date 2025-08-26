"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-[#111111] min-h-screen w-full">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-5">
        <Image
          src="/images/devmatch-bg-none.png"
          alt="DevMatch logo"
          width={130}
          height={130}
          priority
          className="w-auto h-auto"
        />
        <Button
          onClick={() => router.push("/auth/register")}
          className="hidden lg:block text-base font-medium text-white rounded-full border border-white/20 bg-transparent hover:bg-white/5 px-5 py-2 transition-colors hover:ring-2 hover:text-white hover:ring-white/20"
          variant="outline"
          size="lg"
        >
         Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="px-5">
        <section className="relative flex flex-col lg:flex-row items-center justify-between gap-8 text-white p-3">
          {/* Hero Text */}
          <div className="max-w-2xl lg:p-4 space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-gray-300">
              Build together, faster
            </span>
            <h1 className="text-3xl lg:text-6xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FF0077] to-[#FFA500] leading-tight">
              Connect with developers. Collaborate on projects. Ship great products.
            </h1>
            <p className="text-lg lg:text-2xl font-light text-gray-300">
              DevMatch helps you find collaborators, spin up conversations, and manage project work — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                onClick={() => router.push("/auth/register")}
                className="text-lg font-semibold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white py-3 px-6 rounded-md hover:scale-105 hover:from-[#1D4ED8] hover:to-[#2563EB] hover:shadow-lg hover:shadow-[#2563EB]/50 transition-all duration-300"
                size="lg"
              >
                Get started
              </Button>
             
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-gray-300">
              
              <span>Join a growing community of builders</span>
              <span className="hidden md:inline-block h-4 w-px bg-white/20" />
              <ul className="hidden md:flex items-center gap-4">
                <li className="inline-flex items-center gap-1.5">
                  <span>👩‍💻</span>
                  <span>2k+ developers</span>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span>🚀</span>
                  <span>1k+ projects</span>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Realtime chat</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:p-4">
            <Image
              src="/images/main.jpg"
              alt="DevMatch preview"
              width={520}
              height={390}
              priority
              className="w-auto h-auto hidden lg:block rounded-md object-contain"
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="text-white py-8 px-4">
          <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-[#161616] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors hover:border-white/20">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-white/10 text-white">💬</div>
              <h3 className="text-lg font-semibold">Real-time chat</h3>
              <p className="mt-1 text-sm text-gray-300">Stay in sync with conversations, read receipts, and message threads.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#161616] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors hover:border-white/20">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-white/10 text-white">👥</div>
              <h3 className="text-lg font-semibold">Find collaborators</h3>
              <p className="mt-1 text-sm text-gray-300">Discover developers by skills and interests, then send or accept requests.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#161616] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors hover:border-white/20">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-white/10 text-white">📦</div>
              <h3 className="text-lg font-semibold">Manage projects</h3>
              <p className="mt-1 text-sm text-gray-300">Create, update, and track projects so everyone knows what’s next.</p>
            </div>
          </div>
        </section>
        <section className=" text-white py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-10">
            {/* Image */}
            <div className="flex-1">
              <Image
                src="/images/project.jpg" // Replace with your actual image path
                alt="Project showcase illustration"
                width={600}
                height={400}
                className="rounded-lg shadow-lg w-full h-auto"
                priority
              />
            </div>
            {/* Text Content */}
            <div className="flex-1">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6    text-transparent bg-clip-text bg-gradient-to-r from-[#FF0077] to-[#FFA500] leading-tight">
                Showcase Your Projects
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Share what you're building with other developers. Whether it's a
                small side project or something bigger, DevMatch lets you post
                your work, add some details, and get it in front of the
                community.
              </p>
              <Button
                onClick={() => router.push("/auth/register")}
                className="text-lg mt-7 font-semibold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white py-3 px-6 rounded-md hover:scale-105 hover:from-[#1D4ED8] hover:to-[#2563EB] hover:shadow-lg hover:shadow-[#2563EB]/50 transition-all duration-300"
                size="lg"
                variant="secondary"
              >
                Start Showcasing
              </Button>
            </div>
          </div>
        </section>

        {/* project planning */}
        <section className="py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 text-white">
            {/* Text Section */}
            <div className="flex-1">
              {/* Section Title with Gradient Text */}
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FF0077] to-[#FFA500] leading-tight">
                Plan, Discuss, and Build Together
              </h2>

              {/* Section Description */}
              <p className="text-lg lg:text-xl text-gray-300 mb-6 leading-relaxed animate__animated animate__fadeIn animate__delay-2s">
                DevMatch lets you plan your projects and discuss ideas with
                other developers. Create project, share your plans, and
                collaborate through messaging. Whether you're working alone or
                with a team, DevMatch helps you stay organized and connected.
              </p>

              <p className="text-lg lg:text-xl text-gray-300 mb-6 leading-relaxed animate__animated animate__fadeIn animate__delay-3s">
                Share your challenges, ask for advice, or get help from other
                developers. The more you interact, the more you'll grow, both as
                a developer and as part of a thriving community of creators.
              </p>

              {/* Call-to-Action Button */}
              <Button
                onClick={() => router.push("/auth/register")}
                className="text-lg mt-7 font-semibold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white py-3 px-6 rounded-md hover:scale-105 hover:from-[#1D4ED8] hover:to-[#2563EB] hover:shadow-lg hover:shadow-[#2563EB]/50 transition-all duration-300"
                size="lg"
                variant="secondary"
              >
                Start Planning Together
              </Button>
            </div>
            {/* Image Section */}
            <div className="lg:flex hidden">
              <Image
                src="/images/projectPlanning.jpg" // Replace with your actual image path
                alt="Developers discussing a project"
                width={600}
                height={400}
                className="rounded-xl shadow-xl w-auto h-auto "
                priority
              />
            </div>
          </div>
        </section>
        {/* footer */}

        <footer className="mt-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-5 py-10 text-sm text-gray-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/devmatch-bg-none.png"
                  alt="DevMatch Logo"
                  width={112}
                  height={32}
                  quality={100}
                  sizes="112px"
                  className="h-8 w-auto"
                />
                
              </div>

              <nav className="flex items-center gap-6">
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
              </nav>

              <div className="flex items-center gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="opacity-80 hover:opacity-100 transition-opacity">
                  <Image src="/logos/twitter_logo.svg" alt="Twitter" width={20} height={20} className="h-5 w-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="opacity-80 hover:opacity-100 transition-opacity">
                  <Image src="/logos/github_logo.svg" alt="GitHub" width={20} height={20} className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} DevMatch. All rights reserved.</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <span className="h-3 w-px bg-white/10" />
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
