"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Plus, Upload, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import useAuthSync from "@/hooks/useAuthSync";
import { setUser } from "@/redux/slices/authSlice";

export default function EditProfilePage() {
  useAuthSync();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch(); 
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial form data for change detection
  const initialFormData = {
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    socials: {
      github: user?.socials?.github ? `https://github.com/${user.socials.github}` : "",
      twitter: user?.socials?.twitter ? `https://twitter.com/${user.socials.twitter}` : "",
      linkedin: user?.socials?.linkedin ? `https://linkedin.com/in/${user.socials.linkedin}` : "",
      portfolio: "",
    },
  };
  const initialSkills = user?.skills || [];

  // Current form data and skills
  const [formData, setFormData] = useState(initialFormData);
  const [skills, setSkills] = useState(initialSkills);
  const [newSkill, setNewSkill] = useState("");

  // Ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/signin");
    }
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        socials: {
          github: user.socials?.github ? `https://github.com/${user.socials.github}` : "",
          twitter: user.socials?.twitter ? `https://twitter.com/${user.socials.twitter}` : "",
          linkedin: user.socials?.linkedin ? `https://linkedin.com/in/${user.socials.linkedin}` : "",
          portfolio: "",
        },
      });
      setSkills(user.skills || []);
    }
  }, [isAuthenticated, loading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formDataToSend = new FormData();

    // Only append changed fields
    if (formData.name !== initialFormData.name) formDataToSend.append("name", formData.name);
    if (formData.username !== initialFormData.username) formDataToSend.append("username", formData.username);
    if (formData.bio !== initialFormData.bio) formDataToSend.append("bio", formData.bio);
    if (formData.location !== initialFormData.location) formDataToSend.append("location", formData.location);

    // Partial skills (full array if changed)
    if (JSON.stringify(skills) !== JSON.stringify(initialSkills)) formDataToSend.append("skills", JSON.stringify(skills));

    const changedSocials: Partial<typeof formData.socials> = {};
Object.keys(formData.socials).forEach((key) => {
  const typedKey = key as keyof typeof formData.socials;
  if (formData.socials[typedKey] !== initialFormData.socials[typedKey]) {
    changedSocials[typedKey] = formData.socials[typedKey];
  }
});
    if (Object.keys(changedSocials).length > 0) {
      formDataToSend.append("socials", JSON.stringify(changedSocials));
    }

    if (selectedFile) {
      formDataToSend.append("profileImage", selectedFile);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CLIENT_URL}/profile/update-user-details`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      console.log("Profile updated:", data);
      
     // Construct updated user object for Redux
     const updatedUser = {
      id: user?.id || "",
      name: formData.name,
      email: user?.email || "",
      username: formData.username,
      bio: formData.bio,
      location: formData.location,
      skills,
      socials: { ...user?.socials, ...changedSocials }, 
    };

    // Update Redux state
    dispatch(setUser(updatedUser));
      router.push("/profile"); // Redirect on success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Update failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleInputChange = (
    field: string,
    value: string | { [key: string]: string }
  ) => {
    if (field === "github" || field === "twitter" || field === "linkedin" || field === "portfolio") {
      setFormData((prev) => ({
        ...prev,
        socials: { ...prev.socials, [field]: value as string },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleUploadClick = () => {
    console.log("Upload button clicked");
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a professional photo that represents you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Image
                  src={user?.profileImage || "/images/placeholder-user.jpg"}
                  className="rounded-full border border-border"
                  width={104}
                  height={104}
                  alt="Profile Picture"
                />
                <div>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="profileImageUpload"
                      className="hidden"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          console.log("File selected:", file.name);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleUploadClick}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">JPG, PNG. Max size 5MB.</p>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell other developers about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Your username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself, your interests, and what you're working on..."
                  rows={4}
                  maxLength={300}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.bio.length}/300 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, Country"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologies</CardTitle>
              <CardDescription>Add your technical skills to help others find you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social profiles to showcase your work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    https://github.com/
                  </span>
                  <Input
                    id="github"
                    value={formData.socials.github.replace("https://github.com/", "")}
                    onChange={(e) => handleInputChange("github", `https://github.com/${e.target.value}`)}
                    placeholder="username"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    https://linkedin.com/in/
                  </span>
                  <Input
                    id="linkedin"
                    value={formData.socials.linkedin.replace("https://linkedin.com/in/", "")}
                    onChange={(e) => handleInputChange("linkedin", `https://linkedin.com/in/${e.target.value}`)}
                    placeholder="username"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    https://twitter.com/
                  </span>
                  <Input
                    id="twitter"
                    value={formData.socials.twitter.replace("https://twitter.com/", "")}
                    onChange={(e) => handleInputChange("twitter", `https://twitter.com/${e.target.value}`)}
                    placeholder="username"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/profile">
              <Button variant="outline" type="button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}