"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import CustomProfile from "./CustomProfile";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const Header = () => {
  const { isSignedIn } = useAuth();
  const hasGenerated = useQuery(api.user.hasGeneratedPortfolio);

  return (
    <header className="py-6 px-6 md:px-12 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/"}>
          <div className="font-bold text-xl">ResumeToFolio</div>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-md font-medium hover:text-primary/80 transition-colors"
            >
              How It Works
            </Link>
            {isSignedIn && hasGenerated !== true && (
              <Link
                href="/gen"
                className="text-md font-medium hover:text-primary/80 transition-colors"
              >
                Generate
              </Link>
            )}
            {isSignedIn && hasGenerated === true && (
              <Link
                href="/preview"
                className="text-md font-medium hover:text-primary/80 transition-colors"
              >
                My Portfolio
              </Link>
            )}
          </nav>
          {isSignedIn ? (
            <CustomProfile />
          ) : (
            <SignInButton mode="modal">
              <Button variant="default" size="lg" className="rounded-full">
                Login
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
