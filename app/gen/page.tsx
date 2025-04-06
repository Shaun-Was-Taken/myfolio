"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  AlertCircle,
  Trash2,
  Wand2,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const GenPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  // Add these drag and drop handlers inside the component
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (parsing || uploading) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      
      // Check file type
      const fileType = selectedFile.type;
      if (
        fileType !== "application/pdf"
      ) {
        setError("Please upload a PDF");
        return;
      }

      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setParsedText(null);
    }
  };

  const hasGenerated = useQuery(api.user.hasGeneratedPortfolio);

  // Redirect if user has already generated a portfolio
  useEffect(() => {
    if (hasGenerated === true) {
      router.push("/preview");
    }
  }, [hasGenerated, router]);

  // Fetch the resume data to get the current status
  const resume = useQuery(
    api.resume.getResumeById,
    resumeId ? { resumeId: resumeId as Id<"resume"> } : "skip"
  );

  const generateUploadUrl = useMutation(api.resume.generateUploadUrl);
  const saveResume = useMutation(api.resume.saveResume);
  const deleteResume = useMutation(api.resume.deleteResume);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setParsedText(null);

    if (!selectedFile) return;

    // Check file type
    const fileType = selectedFile.type;
    if (
      fileType !== "application/pdf"
    ) {
      setError("Please upload a PDF");
      return;
    }

    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setParsing(true);

    try {
      // Step 1: Parse the resume content
      const formData = new FormData();
      formData.append("FILE", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to parse resume: ${response.statusText}`);
      }

      // Get the parsed text directly from the response
      const parsedText = await response.text();

      if (!parsedText) {
        throw new Error(
          "Failed to parse resume content. Please try a different file."
        );
      }

      // console.log("Parsed resume text preview:", parsedText.substring(0, 200) + "...");
      setParsedText(parsedText);

      // Step 2: Get a URL for uploading the file
      const uploadUrl = await generateUploadUrl();

      // Step 3: Upload the file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      // Step 4: Get the file ID from the response
      const { storageId } = await result.json();

      // Step 5: Save the resume metadata in the database
      const id = await saveResume({
        fileName: file.name,
        fileId: storageId,
        fileSize: file.size,
        fileType: file.type,
        resumeText: parsedText || "",
      });

      // Set success state and store resume ID
      setUploadSuccess(true);
      setResumeId(id);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload file. Please try again."
      );
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleDelete = async () => {
    if (!resumeId) return;

    try {
      if (!resumeId) throw new Error("Resume ID is required");
      const id = resumeId as Id<"resume">;
      await deleteResume({ id });
      // Reset the state
      setUploadSuccess(false);
      setResumeId(null);
      setFile(null);
      setParsedText(null);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete resume. Please try again.");
    }
  };

  // Helper function to render the appropriate button based on resume status
  const renderActionButton = () => {
    if (!resume) {
      return (
        <Button
          size="lg"
          className="rounded-full flex items-center gap-2"
          disabled={true}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </Button>
      );
    }

    if (resume.status === "processing") {
      return (
        <Button
          size="lg"
          className="rounded-full flex items-center gap-2"
          disabled={true}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing Resume...
        </Button>
      );
    }

    if (resume.status === "error") {
      return (
        <Button
          size="lg"
          className="rounded-full flex items-center gap-2"
          disabled={true}
        >
          <AlertCircle className="h-4 w-4" />
          Processing Failed
        </Button>
      );
    }

    if (resume.status === "processed") {
      return (
        <Link href={"/preview"}>
          <Button
            size="lg"
            className="rounded-full flex items-center gap-2"
            disabled={generating}
          >
            <Wand2 className="h-4 w-4" />
            {generating ? "Generating..." : "Generate Portfolio"}
          </Button>
        </Link>
      );
    }

    // Default state (uploaded)
    return (
      <Button
        size="lg"
        className="rounded-full flex items-center gap-2"
        disabled={true}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Analyzing Resume...
      </Button>
    );
  };

  return (
    <div className="min-h-screen py-16 px-6 md:px-12">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {uploadSuccess ? "Resume Uploaded" : "Upload Your Resume"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {uploadSuccess
              ? resume?.status === "processed"
                ? "Your resume has been analyzed and is ready for portfolio generation."
                : "Your resume is being analyzed. This may take a moment."
              : "Upload your resume in PDF format and we'll transform it into a professional portfolio website."}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-8 shadow-sm">
          {!uploadSuccess ? (
            <>
              <div
                className={`border-2 border-dashed rounded-md p-12 text-center ${
                  file
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20"
                } transition-colors cursor-pointer ${parsing || uploading ? "opacity-70" : ""}`}
                onClick={() =>
                  !(parsing || uploading) &&
                  document.getElementById("resume-upload")?.click()
                }
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
              >
                {parsing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium">Parsing resume...</p>
                      <p className="text-sm text-muted-foreground">
                        This may take a moment
                      </p>
                    </div>
                  </div>
                ) : uploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium">Uploading resume...</p>
                      <p className="text-sm text-muted-foreground">
                        This may take a moment
                      </p>
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {parsedText && (
                        <p className="text-sm text-green-600 mt-2">
                          Resume parsed successfully!
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Drag and drop your resume here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse (PDF, max 5MB)
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  onClick={() =>
                    !(parsing || uploading) &&
                    document.getElementById("resume-upload")?.click()
                  }
                  disabled={parsing || uploading}
                >
                  Browse Files
                </Button>

                <Button
                  size="lg"
                  className="rounded-full"
                  disabled={!file || uploading || parsing}
                  onClick={handleUpload}
                >
                  {uploading
                    ? "Uploading..."
                    : parsing
                      ? "Parsing..."
                      : "Upload Resume"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-primary" />
              </div>

              <h3 className="text-xl font-medium mb-2">Resume Ready</h3>
              <p className="text-muted-foreground text-center mb-8">
                {resume?.status === "processed"
                  ? "Your resume has been analyzed and is ready for portfolio generation."
                  : resume?.status === "error"
                    ? "There was an error analyzing your resume. Please try uploading again."
                    : "Your resume is being analyzed. This may take a moment."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full flex items-center gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Resume
                </Button>

                {renderActionButton()}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenPage;

