

"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../../redux/hooks";
import useAuthSync from "@/hooks/useAuthSync";
import Image from "next/image";
import {
  Github,
  Linkedin,
  Twitter,
  MapPin,
  Calendar,
  Edit,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios"
import { IProject } from "@/models/Project";
function Profile() {

  // Sync NextAuth with Redux
  useAuthSync();

  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  
  // Fetching user projects details 
  const [projects, setProjects] = useState<IProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_CLIENT_URL}projects/get-all-projects`);
        console.log("Projects API Response:", response);
        setProjects(response.data.data || []);
      } catch (err) {
        setError('Failed to load projects');
        console.error("Error fetching projects:", err);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  if (!isAuthenticated) {
    return null;
  }

  // Project Card Component with navigation
  const ProjectCard = ({ project }: { project: IProject }) => {
    const handleCardClick = () => {
      router.push(`/projects/${project._id}`);
    };

    const handleLinkClick = (e: React.MouseEvent, url: string) => {
      e.stopPropagation();
      window.open(url, '_blank');
    };

    return (
      <Card 
        className="group hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img 
            src={project.media?.images?.[0]?.url || "/images/project.jpg"} 
            alt={project.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={project.isCollabrating ? "default" : "secondary"}>
              {project.isCollabrating ? "Collaboration" : "Showcase"}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <Link href={`/projects/${project._id}`}>
              <CardTitle className="text-lg group-hover:text-primary transition-colors cursor-pointer">
                {project.title}
              </CardTitle>
            </Link>
            <Badge variant="outline" className="ml-2">
              {project.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
          <CardDescription className="text-sm line-clamp-2">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-4">
            {project.techStack?.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.techStack && project.techStack.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.techStack.length - 4} more
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {project.githubUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleLinkClick(e, project.githubUrl!)}
                >
                  <Github className="h-4 w-4" />
                </Button>
              )}
              {project.liveUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleLinkClick(e, project.liveUrl!)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Project Skeleton Component
  const ProjectSkeleton = () => {
    return (
      <Card className="group hover:shadow-md transition-shadow">
        <Skeleton className="aspect-video w-full rounded-t-lg" />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render profile
  return (
    <div className="container mx-auto px-2 py-4">
      {/* Profile component */}
      <Card className="max-w-6xl mx-auto mb-8">
        <CardContent>
          {user && (
            <div className="rounded-lg p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 mb-6">
                <div className="flex flex-col items-center md:items-start gap-y-3">
                  <Image
                    className="border-2 bg-cover rounded-full"
                    src={
                      user.profileImage
                        ? user.profileImage
                        : "/images/placeholder-user.jpg"
                    }
                    width={114}
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
                      {projects.length}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Projects
                    </span>
                  </div>
                  <div>
                    <div className="lg:text-3xl text-xl font-semibold">
                      {projects.filter(p => p.isCollabrating).length}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Collaborations
                    </span>
                  </div>
                  <div>
                    <div className="lg:text-3xl text-xl font-semibold">
                      {user?.connections?.length || 0}
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

      {/* Projects Section */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          </TabsList>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Skeleton loading for projects */}
        {projectsLoading ? (
          <>
            <TabsContent value="all">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProjectSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="showcase">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <ProjectSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="collaboration">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <ProjectSkeleton key={i} />
                ))}
              </div>
            </TabsContent>
          </>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              You haven't created any projects yet.
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <TabsContent value="all">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="showcase">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter((p) => !p.isCollabrating)
                  .map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="collaboration">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter((p) => p.isCollabrating)
                  .map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

export default Profile;