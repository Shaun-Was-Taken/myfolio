"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Save,
  Upload,
  Camera,
  Image as ImageIcon,
  UserCircle,
  Home,
  Briefcase,
  GraduationCap,
  Boxes,
  Award,
  Wrench,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { EducationLogoUploader } from "@/components/sidebar/EducationLogoUploader";
import { CompanyLogoUploader } from "@/components/sidebar/CompanyLogoUploader";
import { ProjectImageUploader } from "@/components/sidebar/ProjectImageUploader";

export function AppSidebar() {
  const [defaultSection, setDefaultSection] = useState<string | undefined>(
    "profile-picture"
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user, isLoaded } = useUser();
  const { setOpen, isMobile, setOpenMobile } = useSidebar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const portfolioData = useQuery(
    api.resume.getPreviewData,
    isLoaded && user ? { clerkId: user.id } : "skip"
  );

  const generateUploadUrl = useMutation(api.resume.generateImageUploadUrl);
  const updateProfilePictureUrl = useMutation(
    api.resume.updateProfilePictureUrl
  );
  const updateResumeField = useMutation(api.resume.updateResumeField);

  // Set initial profile picture from portfolio data and determine default section
  useEffect(() => {
    if (portfolioData) {
      // Set profile picture if available
      if (portfolioData.profilePicture) {
        setImagePreview(portfolioData.profilePicture);
      }

      // Determine default section to expand based on available data
      if (
        !portfolioData.profilePicture &&
        portfolioData.education &&
        portfolioData.education.length > 0
      ) {
        setDefaultSection("education");
      } else if (
        !portfolioData.profilePicture &&
        !portfolioData.education?.length &&
        portfolioData.experience &&
        portfolioData.experience.length > 0
      ) {
        setDefaultSection("experience");
      } else if (
        !portfolioData.profilePicture &&
        !portfolioData.education?.length &&
        !portfolioData.experience?.length &&
        portfolioData.projects &&
        portfolioData.projects.length > 0
      ) {
        setDefaultSection("projects");
      }
    }
  }, [portfolioData]);

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
      if (
        imagePreview &&
        typeof imagePreview === "string" &&
        imagePreview.includes("convex.cloud") &&
        !selectedFile
      ) {
        // Just update the reference
        await updateResumeField({
          field: "profilePicture",
          value: imagePreview,
        });
        toast.success("Profile picture updated successfully");
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
          throw new Error(
            `Upload failed: ${result.status} ${result.statusText}`
          );
        }

        // Get the storage ID from the response
        const { storageId } = await result.json();

        // Update the profile picture URL in the database
        const response = await updateProfilePictureUrl({
          storageId,
        });

        if (response.profilePicture) {
          // Update the local preview with the new URL
          setImagePreview(response.profilePicture);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          toast.success("Profile picture uploaded successfully");
        }
      }
    } catch (error) {
      console.error("Error saving profile picture:", error);
      toast.error("Failed to save profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2 py-3">
          <UserCircle className="mr-2 h-5 w-5" />
          <span className="text-lg font-semibold">Edit Portfolio</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultSection}
          className="w-full"
        >
          <AccordionItem value="profile-picture">
            <AccordionTrigger className="px-2">
              <span className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile Picture
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-2">
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    {imagePreview ? (
                      <div className="mb-4 relative h-24 w-24 rounded-full overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Profile preview"
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
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}

                    <div className="space-y-2 w-full">
                      <Label
                        htmlFor="profile-picture"
                        className="text-xs font-medium"
                      >
                        Choose an image
                      </Label>
                      <Input
                        id="profile-picture"
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
                        onClick={() =>
                          document.getElementById("profile-picture")?.click()
                        }
                        disabled={isUploading}
                      >
                        <Upload className="mr-2 h-3 w-3" />
                        Upload Image
                      </Button>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={handleSaveChanges}
                        disabled={
                          isUploading ||
                          !imagePreview ||
                          (imagePreview === portfolioData?.profilePicture &&
                            !selectedFile)
                        }
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
                      <p className="text-xs text-muted-foreground text-center">
                        Square JPG/PNG, 500×500px+
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Basic info accordion item removed */}

          <AccordionItem value="education">
            <AccordionTrigger className="px-2">
              <span className="flex items-center">
                <GraduationCap className="mr-2 h-4 w-4" />
                Education
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {portfolioData?.education &&
              portfolioData.education.length > 0 ? (
                <div className="space-y-4 p-2">
                  {portfolioData.education.map(
                    (education: any, index: number) => (
                      <EducationLogoUploader
                        key={index}
                        education={education}
                        index={index}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="px-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    No education records found.
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="experience">
            <AccordionTrigger className="px-2">
              <span className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Experience
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {portfolioData?.experience &&
              portfolioData.experience.length > 0 ? (
                <div className="space-y-4 p-2">
                  {portfolioData.experience.map(
                    (experience: any, index: number) => (
                      <CompanyLogoUploader
                        key={index}
                        experience={experience}
                        index={index}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="px-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    No work experience records found.
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="projects">
            <AccordionTrigger className="px-2">
              <span className="flex items-center">
                <Boxes className="mr-2 h-4 w-4" />
                Projects
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {portfolioData?.projects && portfolioData.projects.length > 0 ? (
                <div className="space-y-4 p-2">
                  {portfolioData.projects.map((project: any, index: number) => (
                    <ProjectImageUploader
                      key={index}
                      project={project}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    No projects found.
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Skills and Certifications accordion items removed */}
        </Accordion>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <Button className="w-full" onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}>Close</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
