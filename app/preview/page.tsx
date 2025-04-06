"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import Portfolio from "@/components/Portfolio";
import { Button } from "@/components/ui/button";
import { Send, Copy } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PreviewPage = () => {
  const { user, isLoaded } = useUser();
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Move the useQuery hook here, before any conditional returns
  const portfolioData = useQuery(
    api.resume.getPreviewData,
    isLoaded && user ? { clerkId: user.id } : "skip"
  );

  // Use useEffect for navigation instead of conditional rendering
  useEffect(() => {
    if (isLoaded && !user) {
      window.location.href = "/";
    }
  }, [isLoaded, user]);

  // Generate portfolio URL when user data is available
  useEffect(() => {
    if (user) {
      // You can customize this URL based on your routing structure
      setPortfolioUrl(
        `${window.location.origin}/${user?.emailAddresses[0].toString().split("@")[0]}`
      );
    }
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portfolioUrl);
  };

  // Show loading state while checking user or loading data
  if (!isLoaded || portfolioData === undefined) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex justify-center gap-5 ">
      <div className="max-w-[1300px] ">
        <Portfolio portfolioData={portfolioData} />
      </div>

      <div className="py-20 max-w-[200px] flex-1">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center justify-center cursor-pointer">
              Publish
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share your portfolio</DialogTitle>
              <DialogDescription>
                Anyone with this link will be able to view your portfolio.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input id="link" value={portfolioUrl} readOnly />
              </div>
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={copyToClipboard}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PreviewPage;
