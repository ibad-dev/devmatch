// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { X, Plus, Upload, Save, ArrowLeft, Github, ExternalLink } from "lucide-react"
// import Link from "next/link"

// export default function NewProjectPage() {
//   const [isLoading, setIsLoading] = useState(false)
//   const [techStack, setTechStack] = useState<string[]>([])
//   const [newTech, setNewTech] = useState("")
//   const [tags, setTags] = useState<string[]>([])
//   const [newTag, setNewTag] = useState("")

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     isCollabrating:false,
//     githubUrl: "",
//     liveUrl: "",
//     lookingForCollaborators: false,
//   })

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
  

//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false)
     
     
//     }, 1000)
//   }

//   const addTech = () => {
//     if (newTech.trim() && !techStack.includes(newTech.trim())) {
//       setTechStack([...techStack, newTech.trim()])
//       setNewTech("")
//     }
//   }

//   const removeTech = (techToRemove: string) => {
//     setTechStack(techStack.filter((tech) => tech !== techToRemove))
//   }

//   const addTag = () => {
//     if (newTag.trim() && !tags.includes(newTag.trim())) {
//       setTags([...tags, newTag.trim()])
//       setNewTag("")
//     }
//   }

//   const removeTag = (tagToRemove: string) => {
//     setTags(tags.filter((tag) => tag !== tagToRemove))
//   }

//   const handleInputChange = (field: string, value: string | boolean) => {
//     if (field === "isCollabrating") {
    
//       setFormData((prev) => ({
//         ...prev,
//         isCollabrating: value === "Collaboration" ? true : false,
//       }));
//     } else {
  
//       setFormData((prev) => ({ ...prev, [field]: value }));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
     
//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Project Details</CardTitle>
//               <CardDescription>Tell us about your project</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="title">Project Title</Label>
//                 <Input
//                   id="title"
//                   value={formData.title}
//                   onChange={(e) => handleInputChange("title", e.target.value)}
//                   placeholder="My Awesome Project"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={formData.description}
//                   onChange={(e) => handleInputChange("description", e.target.value)}
//                   placeholder="Describe what your project does, the problem it solves, and what makes it special..."
//                   rows={4}
//                   maxLength={1000}
//                   required
//                 />
//                 <p className="text-sm text-muted-foreground">{formData.description.length}/1000 characters</p>
//               </div>

//               <div className="space-y-3">
//   <Label>Project Type</Label>
//   <RadioGroup
//     value={formData.isCollabrating ? "Collaboration" : "Showcase"} 
//     onValueChange={(value) => handleInputChange("isCollabrating", value)} 
//     className="flex flex-col space-y-2"
//   >
//     <div className="flex items-center space-x-2">
//       <RadioGroupItem value="Showcase" id="showcase" />
//       <Label htmlFor="showcase" className="cursor-pointer">
//         <div>
//           <div className="font-medium">Showcase</div>
//           <div className="text-sm text-muted-foreground">
//             Display your completed work (visible only on your profile)
//           </div>
//         </div>
//       </Label>
//     </div>
//     <div className="flex items-center space-x-2">
//       <RadioGroupItem value="Collaboration" id="collaboration" />
//       <Label htmlFor="collaboration" className="cursor-pointer">
//         <div>
//           <div className="font-medium">Collaboration</div>
//           <div className="text-sm text-muted-foreground">
//             Looking for collaborators (visible on profile + home feed)
//           </div>
//         </div>
//       </Label>
//     </div>
//   </RadioGroup>
// </div>
//             </CardContent>
//           </Card>

//           {/* Tech Stack */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Technology Stack</CardTitle>
//               <CardDescription>What technologies did you use?</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex flex-wrap gap-2">
//                   {techStack.map((tech) => (
//                     <Badge key={tech} variant="secondary" className="flex items-center gap-1">
//                       {tech}
//                       <button
//                         type="button"
//                         onClick={() => removeTech(tech)}
//                         className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     value={newTech}
//                     onChange={(e) => setNewTech(e.target.value)}
//                     placeholder="Add technology..."
//                     onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
//                   />
//                   <Button type="button" variant="outline" onClick={addTech}>
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Tags */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Tags</CardTitle>
//               <CardDescription>Add tags to help others discover your project</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex flex-wrap gap-2">
//                   {tags.map((tag) => (
//                     <Badge key={tag} variant="outline" className="flex items-center gap-1">
//                       {tag}
//                       <button
//                         type="button"
//                         onClick={() => removeTag(tag)}
//                         className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <Input
//                     value={newTag}
//                     onChange={(e) => setNewTag(e.target.value)}
//                     placeholder="Add tag..."
//                     onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
//                   />
//                   <Button type="button" variant="outline" onClick={addTag}>
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Links */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Project Links</CardTitle>
//               <CardDescription>Share your code and live demo</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="githubUrl">GitHub Repository</Label>
//                 <div className="flex">
//                   <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
//                     <Github className="h-4 w-4 mr-1" />
//                     github.com/
//                   </span>
//                   <Input
//                     id="githubUrl"
//                     value={formData.githubUrl}
//                     onChange={(e) => handleInputChange("githubUrl", e.target.value)}
//                     placeholder="username/repository"
//                     className="rounded-l-none"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="liveUrl">Live Demo URL (Optional)</Label>
//                 <div className="flex">
//                   <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
//                     <ExternalLink className="h-4 w-4 mr-1" />
//                     https://
//                   </span>
//                   <Input
//                     id="liveUrl"
//                     value={formData.liveUrl}
//                     onChange={(e) => handleInputChange("liveUrl", e.target.value)}
//                     placeholder="yourproject.com"
//                     className="rounded-l-none"
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Project Images */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Project Images</CardTitle>
//               <CardDescription>Upload screenshots or demo images of your project</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
//                 <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <div className="text-sm text-muted-foreground mb-2">Drag and drop images here, or click to browse</div>
//                 <Button variant="outline" type="button">
//                 {/* <Label htmlFor="images">Choose Files</Label> */}
//                 <input type="file" name="images" id="images" />
//                 </Button>
//                 <p className="text-xs text-muted-foreground mt-2">PNG, JPG, up to 5MB each</p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Save Button */}
//           <div className="flex justify-end space-x-4">
//             <Link href="/profile">
//               <Button variant="outline" type="button">
//                 Cancel
//               </Button>
//             </Link>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? (
//                 "Creating..."
//               ) : (
//                 <>
//                   <Save className="h-4 w-4 mr-2" />
//                   Create Project
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }


"use client"

import type React from "react"
import { useState, useRef, ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, Upload, Save, ArrowLeft, Github, ExternalLink, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ImagePreview {
  id: string
  file: File
  previewUrl: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [techStack, setTechStack] = useState<string[]>([])
  const [newTech, setNewTech] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isCollabrating: false,
    githubUrl: "",
    liveUrl: "",
    status: "published", // Default to published
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSubmitError(null)
  
    try {
      // Create FormData for API submission
      const submitData = new FormData()
      
      // Add form fields
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("isCollabrating", formData.isCollabrating.toString())
      submitData.append("githubUrl", formData.githubUrl)
      submitData.append("liveUrl", formData.liveUrl)
      submitData.append("status", formData.status)
      
      // Add arrays as JSON strings
      if (techStack.length > 0) {
        submitData.append("techStack", JSON.stringify(techStack))
      }
      
      if (tags.length > 0) {
        submitData.append("tags", JSON.stringify(tags))
      }
      
      // Add image files
      imagePreviews.forEach((image) => {
        submitData.append("images", image.file)
      })
      
      // Make API call
      console.log()
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_URL}projects/create-project`, {
        method: "POST",
        body: submitData,
       
        // credentials: 'include' if you need to send cookies
      })
      
      if (!response.ok) {
        console.log("RES:",response)
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server returned ${response.status}`)
      }
      
      const result = await response.json()
      
      // Redirect to projects page or show success message
      router.push("/projects?created=true")
      
    } catch (error: any) {
      console.error("Error creating project:", error)
      setSubmitError(error.message || "Failed to create project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    
    if (!e.target.files || e.target.files.length === 0) return
    
    const files = Array.from(e.target.files)
    
    // Validate file count
    if (imagePreviews.length + files.length > 10) {
      setUploadError("Maximum 10 images allowed")
      return
    }
    
    const newImagePreviews: ImagePreview[] = []
    
    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed")
        return
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} exceeds 5MB limit`)
        return
      }
      
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      newImagePreviews.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl
      })
    })
    
    setImagePreviews(prev => [...prev, ...newImagePreviews])
    
    // Reset the file input to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (id: string) => {
    // Revoke the object URL to avoid memory leaks
    const imageToRemove = imagePreviews.find(img => img.id === id)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl)
    }
    
    setImagePreviews(prev => prev.filter(img => img.id !== id))
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

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl)
      })
    }
  }, [imagePreviews])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create New Project</h1>
        </div>
        
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Tell us about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="My Awesome Project"
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what your project does, the problem it solves, and what makes it special..."
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  required
                />
                <p className="text-sm text-muted-foreground">{formData.description.length}/2000 characters</p>
              </div>

              <div className="space-y-3">
                <Label>Project Type *</Label>
                <RadioGroup
                  value={formData.isCollabrating ? "Collaboration" : "Showcase"} 
                  onValueChange={(value) => handleInputChange("isCollabrating", value)} 
                  className="flex flex-col space-y-2"
                  required
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
                <Label htmlFor="githubUrl">GitHub Repository (Optional)</Label>
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
                    type="url"
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
                    type="url"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Images */}
          <Card>
            <CardHeader>
              <CardTitle>Project Images</CardTitle>
              <CardDescription>Upload screenshots or demo images of your project (max 10 images, 5MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-md border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.previewUrl}
                          alt="Project preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-100 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  name="images"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-sm text-muted-foreground mb-2">
                  Drag and drop images here, or click to browse
                </div>
                <Button variant="outline" type="button">
                  Select Images
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, up to 5MB each. {imagePreviews.length}/10 images selected
                </p>
                
                {uploadError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/profile">
              <Button variant="outline" type="button" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
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