"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import Portfolio from "@/components/Portfolio";
import { Button } from "@/components/ui/button";
import { ConfettiButton } from "@/components/magicui/confetti";
import { Send, Copy, Edit } from "lucide-react";
import confetti from "canvas-confetti";
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
import { SidebarTrigger } from "@/components/ui/sidebar";

const PreviewPage = () => {
  const { user, isLoaded } = useUser();
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Move the useQuery hook here, before any conditional returns
  const portfolioData = useQuery(
    api.resume.getPreviewData,
    isLoaded && user ? { clerkId: user.id } : "skip"
  );

  const handleClick = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

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
    <div className="flex justify-center gap-5 w-screen">
      <div className="max-w-[1200px]">
        <Portfolio isPreview portfolioData={portfolioData} />
      </div>

      <div className="max-w-[200px] flex-1 mt-20  flex flex-col gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={handleClick}>
              Publish
              <Send className="h-4 w-4" />
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
                className="px-3 cursor-pointer"
                onClick={copyToClipboard}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4 cursor-pointer" />
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

        <SidebarTrigger className="inline-flex items-center justify-center w-full h-9 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs">
          Edit
          <Edit className="h-4 w-4 ml-2" />
        </SidebarTrigger>
      </div>
    </div>
  );
};

export default PreviewPage;
