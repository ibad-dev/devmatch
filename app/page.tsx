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
          className="hidden lg:block text-2xl font-semibold"
          variant="outline"
          size="lg"
        >
          Get Started
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="px-5">
        <section className="flex flex-col lg:flex-row items-center justify-between gap-6 text-white  p-3 ">
          {/* Hero Text */}
          <div className="max-w-2xl lg:p-4 ">
            <h1 className="text-2xl lg:text-6xl font-semibold tracking-tighter   text-transparent bg-clip-text bg-gradient-to-r from-[#FF0077] to-[#FFA500] leading-tight">
              Welcome To devmatch
            </h1>
            <h2 className="mt-4 text-xl lg:text-4xl font-semibold">
              Connect. Collaborate. Code.
            </h2>
            <p className="mt-6 text-xl lg:text-2xl font-light">
              An AI-powered networking platform built exclusively for developers
              — showcase your work, grow your community, and build meaningful
              collaborations.
            </p>
            {/* Visible on large screens */}
            <Button
              onClick={() => router.push("/auth/register")}
              className="text-lg mt-7 font-semibold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white py-3 px-6 rounded-md hover:scale-105 hover:from-[#1D4ED8] hover:to-[#2563EB] hover:shadow-lg hover:shadow-[#2563EB]/50 transition-all duration-300"
              size="lg"
            >
              Connect with Devs
            </Button>
          </div>

          {/* Hero Image */}
          <div className="lg:p-4 ">
            <Image
              src="/images/heroSectionImage.jpg"
              alt="Developers collaborating at DevMatch"
              width={490}
              height={490}
              priority
              className="w-auto h-auto rounded-md"
            />
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

        <footer className="bg-[#111111] text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center px-5">
            {/* Logo Section */}
            <div className="mb-6 lg:mb-0 ">
              <Image
                src="/images/devmatch-bg-none.png" // Replace with your logo path
                alt="DevMatch Logo"
                width={120}
                height={120}
                className="w-auto h-auto "
              />
            </div>

            {/* Minimal Links Section */}
            <div className="flex gap-8 mb-6 lg:mb-0 text-lg">
              <Link
                href="/about"
                className="text-gray-300 hover:text-gray-400 transition duration-300"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-300 hover:text-gray-400 transition duration-300"
              >
                Contact
              </Link>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-6">
              <a
                href="https://twitter.com"
                target="_blank"
                aria-label="Twitter"
                rel="noopener noreferrer"
              >
                <Image
                  src="/logos/twitter_logo.svg" // Replace with your actual image path
                  alt="Developers discussing a project"
                  width={600}
                  height={400}
                  className="w-6 h-6 text-gray-300 hover:text-gray-400 transition duration-300 rounded-xl"
                  priority
                />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                aria-label="GitHub"
                rel="noopener noreferrer"
              >
                <Image
                  src="/logos/github_logo.svg" // Replace with your actual image path
                  alt="Developers discussing a project"
                  width={600}
                  height={400}
                  className="w-6 h-6 text-gray-300 hover:text-gray-400 transition duration-300 rounded-xl"
                  priority
                />
              </a>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="text-center mt-8 text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DevMatch. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
