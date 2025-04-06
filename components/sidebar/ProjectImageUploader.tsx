"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Upload, Camera, Boxes, Loader2, ExternalLink, Github } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProjectImageUploaderProps {
  project: {
    title: string;
    description: string;
    period?: string | null;
    tags?: string[];
    projectPicture?: string | null;
    githubLink?: string | null;
    liveLink?: string | null;
  };
  index: number;
}

export const ProjectImageUploader = ({ project, index }: ProjectImageUploaderProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(project.projectPicture || null);
  const [githubLink, setGithubLink] = useState<string>(project.githubLink || '');
  const [liveLink, setLiveLink] = useState<string>(project.liveLink || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.resume.generateImageUploadUrl);
  const updateProjectImage = useMutation(api.resume.updateProjectImage);
  const updateProjectLinks = useMutation(api.resume.updateProjectLinks);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveLinks = async () => {
    try {
      setIsSavingLinks(true);
      
      // Validate GitHub URL if provided
      if (githubLink && !isValidUrl(githubLink)) {
        toast.error("Please enter a valid GitHub URL");
        return;
      }
      
      // Validate Live URL if provided
      if (liveLink && !isValidUrl(liveLink)) {
        toast.error("Please enter a valid Live URL");
        return;
      }
      
      // Update the project links
      const response = await updateProjectLinks({
        projectIndex: index,
        githubLink: githubLink || null,
        liveLink: liveLink || null
      });
      
      if (response.success) {
        toast.success("Project links updated successfully");
      }
    } catch (error) {
      console.error("Error saving project links:", error);
      toast.error("Failed to save project links");
    } finally {
      setIsSavingLinks(false);
    }
  };
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleSaveChanges = async () => {
    if (!imagePreview) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      setIsUploading(true);
      
      // If the imagePreview is a URL from Convex storage and no new file is selected
      if (imagePreview && typeof imagePreview === 'string' && imagePreview.includes('convex.cloud') && !selectedFile) {
        // No changes needed
        toast.info("No changes to save");
        setIsUploading(false);
        return;
      } else if (selectedFile) {
        // New file selected, upload to Convex storage
        const uploadUrl = await generateUploadUrl();
        
        // Upload the file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        
        if (!result.ok) {
          throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
        }
        
        // Get the storage ID from the response
        const { storageId } = await result.json();
        
        // Update the project image URL in the database
        const response = await updateProjectImage({
          storageId,
          projectIndex: index
        });
        
        if (response.success) {
          // Update the local preview with the new URL
          setImagePreview(response.imageUrl);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          toast.success("Project image uploaded successfully");
        }
      }
    } catch (error) {
      console.error("Error saving project image:", error);
      toast.error("Failed to save project image");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="mb-2">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-sm font-semibold">{project.title}</h4>
            <div className="flex space-x-1">
              {githubLink && (
                <a 
                  href={githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {liveLink && (
                <a 
                  href={liveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          {project.period && (
            <p className="text-xs text-muted-foreground mb-1">{project.period}</p>
          )}
          <p className="text-xs line-clamp-2 mb-1">{project.description}</p>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {project.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0 px-1">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs py-0 px-1">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-3 mb-3">
          {imagePreview ? (
            <div className="relative h-24 w-full rounded-md overflow-hidden">
              <img 
                src={imagePreview} 
                alt={`${project.title} screenshot`} 
                className="h-full w-full object-cover"
              />
              <button 
                className="absolute bottom-2 right-2 bg-primary text-white p-1 rounded-full"
                onClick={() => setImagePreview(null)}
                type="button"
                aria-label="Remove image"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-24 w-full flex items-center justify-center bg-muted rounded-md">
              <Boxes className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          
          <div className="w-full space-y-2">
            <Input
              id={`project-image-${index}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => document.getElementById(`project-image-${index}`)?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-3 w-3" />
              Upload Screenshot
            </Button>
            <Button 
              size="sm"
              className="w-full"
              onClick={handleSaveChanges}
              disabled={isUploading || !imagePreview || (imagePreview === project.projectPicture)}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3 w-3" />
                  Save
                </>
              )}
            </Button>
          </div>
          
          <div className="w-full space-y-3 mt-4 border-t pt-3">
            <h5 className="text-xs font-semibold">Project Links</h5>
            <div className="space-y-2">
              <Label htmlFor={`github-link-${index}`} className="text-xs">
                GitHub Repository URL
              </Label>
              <Input
                id={`github-link-${index}`}
                type="url"
                placeholder="https://github.com/username/repo"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`live-link-${index}`} className="text-xs">
                Live Demo URL
              </Label>
              <Input
                id={`live-link-${index}`}
                type="url"
                placeholder="https://your-project-demo.com"
                value={liveLink}
                onChange={(e) => setLiveLink(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            
            <Button 
              size="sm"
              className="w-full"
              onClick={handleSaveLinks}
              disabled={isSavingLinks || 
                (githubLink === (project.githubLink || '') && 
                 liveLink === (project.liveLink || ''))}
            >
              {isSavingLinks ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving Links...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3 w-3" />
                  Update Links
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};