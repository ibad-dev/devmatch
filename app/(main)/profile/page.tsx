"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAppSelector } from "../../../redux/hooks";
import useAuthSync from "@/hooks/useAuthSync";
import Image from "next/image";
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  MapPin,
  Calendar,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Skeleton
} from "@/components/ui/skeleton";

function Profile() {
  // Sync NextAuth with Redux
  useAuthSync();

  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, loading, router]);

  // Skeleton while loading
  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4">
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, render nothing (redirects already)
  if (!isAuthenticated) {
    return null;
  }

  // Render profile
  return (
    <div className="container mx-auto px-2 py-4">
      <Card className="max-w-6xl mx-auto">
        <CardContent>
          {user && (
            <div className="rounded-lg p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 mb-6">
                <div className="flex flex-col items-center md:items-start gap-y-3">
                  <Image
                    className="border-2 rounded-full"
                    src={
                      user.profileImage
                        ? user.profileImage
                        : "/images/placeholder-user.jpg"
                    }
                    width={94}
                    height={94}
                    alt={`${user.name || "User"}'s profile picture`}
                  />

                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>

                <div className="flex-1 mt-4 md:mt-0">
                  <h2 className="lg:text-3xl text-xl font-semibold text-foreground">
                    {user.name || "User"}
                  </h2>
                  {user.username && (
                    <p className="text-foreground">@{user.username}</p>
                  )}

                  <div className="flex flex-wrap items-center mt-2 gap-4 text-sm text-muted-foreground">
                    {user.location && (
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {user.location}
                      </span>
                    )}

                    {user.createdAt && (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {user.bio && (
                    <p className="lg:text-xl text-lg font-normal mt-5">
                      {user.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div className="mt-4">
                      <h2 className="lg:text-xl font-semibold mb-2">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill: string) => (
                          <Badge
                            variant="secondary"
                            key={skill}
                            className="px-2"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Socials */}
                  <div className="flex mt-4 space-x-4">
                    {user?.socials?.github && (
                      <a
                        href={`https://github.com/${user.socials.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {user?.socials?.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${user.socials.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {user?.socials?.twitter && (
                      <a
                        href={`https://twitter.com/${user.socials.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                  
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-3 text-center gap-4">
                  <div>
                    <div className="lg:text-3xl text-xl font-semibold">
                      {user?.projects?.length || 0}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Projects
                    </span>
                  </div>
                  <div>
                    <div className="lg:text-3xl text-xl font-semibold">
                      {user?.projects?.length || 0}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Collaborations
                    </span>
                  </div>
                  <div>
                    <div className="lg:text-3xl text-xl font-semibold">
                      {user?.projects?.length || 0}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Connections
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
