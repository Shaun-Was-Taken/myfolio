"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Portfolio from "@/components/Portfolio";

const PreviewPage = () => {
  const { isLoaded } = useUser();
  const params = useParams();
  const display_Id = params.displayId as string;

  // Query the portfolio data regardless of user login status
  const portfolioData = useQuery(api.resume.getPublishData, { 
    displayId: display_Id 
  });

  // Show loading state while loading data
  if (!isLoaded || portfolioData === undefined) {
    return <div>Loading...</div>;
  }

  return <Portfolio portfolioData={portfolioData} />;
};

export default PreviewPage;
