"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Portfolio from "@/components/Portfolio";

const PreviewPage = () => {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const display_Id = params.displayId as string;

  // Move the useQuery hook here, before any conditional returns
  const portfolioData = useQuery(
    api.resume.getPublishData,
    isLoaded && user ? { clerkId: user.id, displayId: display_Id } : "skip"
  );

  // Use useEffect for navigation instead of conditional rendering
  useEffect(() => {
    if (isLoaded && !user) {
      window.location.href = "/";
    }
  }, [isLoaded, user]);

  // Show loading state while checking user or loading data
  if (!isLoaded || portfolioData === undefined) {
    return <div>Loading...</div>;
  }

  return <Portfolio portfolioData={portfolioData} />;
};

export default PreviewPage;
