"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Upload, Camera, GraduationCap, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface EducationLogoUploaderProps {
  education: {
    school: string;
    degree: string;
    logo?: string | null;
  };
  index: number;
}

export const EducationLogoUploader = ({ education, index }: EducationLogoUploaderProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(education.logo || null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.resume.generateImageUploadUrl);
  const updateSchoolLogo = useMutation(api.resume.updateSchoolLogo);
  
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
        
        // Update the profile picture URL in the database
        const response = await updateSchoolLogo({
          storageId,
          educationIndex: index
        });
        
        if (response.success) {
          // Update the local preview with the new URL
          setImagePreview(response.logoUrl);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          toast.success("School logo uploaded successfully");
        }
      }
    } catch (error) {
      console.error("Error saving school logo:", error);
      toast.error("Failed to save school logo");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="mb-2">
          <h4 className="text-sm font-semibold">{education.school}</h4>
          <p className="text-xs text-muted-foreground">{education.degree}</p>
        </div>
        
        <div className="flex flex-col items-center gap-3 mb-3">
          {imagePreview ? (
            <div className="relative h-16 w-16 rounded-md overflow-hidden">
              <img 
                src={imagePreview} 
                alt={`${education.school} logo`} 
                className="h-full w-full object-cover"
              />
              <button 
                className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full"
                onClick={() => setImagePreview(null)}
                type="button"
                aria-label="Remove image"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-md">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="w-full space-y-2">
            <Input
              id={`school-logo-${index}`}
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
              onClick={() => document.getElementById(`school-logo-${index}`)?.click()}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-3 w-3" />
              Upload Logo
            </Button>
            <Button 
              size="sm"
              className="w-full"
              onClick={handleSaveChanges}
              disabled={isUploading || !imagePreview || (imagePreview === education.logo)}
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
        </div>
      </CardContent>
    </Card>
  );
};