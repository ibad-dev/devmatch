"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, ExternalLink, Edit, Trash2, ArrowLeft, Users, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

interface Collaborator {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
}

interface IProject {
  _id: string;
  title: string;
  description: string;
  owner: {
    _id: string;
    name: string;
    username: string;
    profileImage?: string;
  };
  tags: string[];
  techStack: string[];
  isCollabrating: boolean;
  githubUrl?: string;
  liveUrl?: string;
  collaborators?: Collaborator[];
  media: {
    video?: {
      url: string;
      publicId: string;
    };
    images: {
      url: string;
      publicId: string;
    }[];
  };
  status: "draft" | "published";
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_CLIENT_URL}projects/get-project-by-id/${projectId}`
        );

        if (response.data.success) {
          setProject(response.data.data);
        } else {
          setError("Failed to load project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_CLIENT_URL}projects/delete-project/${projectId}`
      );

      if (response.data.success) {
        router.push("/profile");
      } else {
        setError("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 rounded-md mr-2" />
            <Skeleton className="h-10 w-64" />
          </div>

          <div className="space-y-6">
            {/* Image Skeleton */}
            <Skeleton className="h-64 w-full rounded-lg" />

            {/* Title & Actions Skeleton */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-72" />
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>

            {/* Description Skeleton */}
            <Skeleton className="h-24 w-full" />

            {/* Tech Stack & Tags Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Links Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Collaborators Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="flex space-x-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.push("/profile")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <Alert>
            <AlertTitle>Project Not Found</AlertTitle>
            <AlertDescription>The project you're looking for doesn't exist.</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.push("/profile")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Project Details</h1>
        </div>

        {/* Project Images */}
        {project.media.images.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.media.images.map((image, index) => (
                <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={image.url}
                    alt={`${project.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <Badge variant={project.status === "published" ? "default" : "secondary"}>
                {project.status}
              </Badge>
              <Badge variant={project.isCollabrating ? "default" : "outline"}>
                {project.isCollabrating ? "Collaboration" : "Showcase"}
              </Badge>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button asChild>
              <Link href={`/projects/update-project-details/${project._id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>

        {/* Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Project Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {project.githubUrl && (
                <Button asChild variant="outline">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub Repository
                  </a>
                </Button>
              )}
              {project.liveUrl && (
                <Button asChild variant="outline">
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Collaborators */}
        {project.isCollabrating && project.collaborators && project.collaborators.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.collaborators.map((collaborator) => (
                  <div key={collaborator._id} className="flex flex-col items-center text-center">

                 <Image width={77} height={77} 
                        src={collaborator.profileImage || "/images/placeholder-user.jpg"}
                        alt={collaborator.name}
                      />

                        {collaborator.name.charAt(0).toUpperCase()}

                    <div>
                      <p className="font-medium">{collaborator.name}</p>
                      <p className="text-sm text-muted-foreground">@{collaborator.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

   
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your project and remove all associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
