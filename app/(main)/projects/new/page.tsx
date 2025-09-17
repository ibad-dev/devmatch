"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, Upload, Save, ArrowLeft, Github, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [techStack, setTechStack] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isCollabrating:false,
    githubUrl: "",
    liveUrl: "",
    lookingForCollaborators: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
     
     
    }, 1000)
  }

  const addTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()])
      setNewTech("")
    }
  }

  const removeTech = (techToRemove: string) => {
    setTechStack(techStack.filter((tech) => tech !== techToRemove))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === "isCollabrating") {
    
      setFormData((prev) => ({
        ...prev,
        isCollabrating: value === "Collaboration" ? true : false,
      }));
    } else {
  
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
     
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Tell us about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what your project does, the problem it solves, and what makes it special..."
                  rows={4}
                  maxLength={1000}
                  required
                />
                <p className="text-sm text-muted-foreground">{formData.description.length}/1000 characters</p>
              </div>

              <div className="space-y-3">
  <Label>Project Type</Label>
  <RadioGroup
    value={formData.isCollabrating ? "Collaboration" : "Showcase"} 
    onValueChange={(value) => handleInputChange("isCollabrating", value)} 
    className="flex flex-col space-y-2"
  >
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="Showcase" id="showcase" />
      <Label htmlFor="showcase" className="cursor-pointer">
        <div>
          <div className="font-medium">Showcase</div>
          <div className="text-sm text-muted-foreground">
            Display your completed work (visible only on your profile)
          </div>
        </div>
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="Collaboration" id="collaboration" />
      <Label htmlFor="collaboration" className="cursor-pointer">
        <div>
          <div className="font-medium">Collaboration</div>
          <div className="text-sm text-muted-foreground">
            Looking for collaborators (visible on profile + home feed)
          </div>
        </div>
      </Label>
    </div>
  </RadioGroup>
</div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
              <CardDescription>What technologies did you use?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Add technology..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                  />
                  <Button type="button" variant="outline" onClick={addTech}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add tags to help others discover your project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
              <CardDescription>Share your code and live demo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub Repository</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    <Github className="h-4 w-4 mr-1" />
                    github.com/
                  </span>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                    placeholder="username/repository"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live Demo URL (Optional)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    https://
                  </span>
                  <Input
                    id="liveUrl"
                    value={formData.liveUrl}
                    onChange={(e) => handleInputChange("liveUrl", e.target.value)}
                    placeholder="yourproject.com"
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Images */}
          <Card>
            <CardHeader>
              <CardTitle>Project Images</CardTitle>
              <CardDescription>Upload screenshots or demo images of your project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-sm text-muted-foreground mb-2">Drag and drop images here, or click to browse</div>
                <Button variant="outline" type="button">
                {/* <Label htmlFor="images">Choose Files</Label> */}
                <input type="file" name="images" id="images" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">PNG, JPG, up to 5MB each</p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/profile">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
