"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import CustomProfile from "./CustomProfile";
import Link from "next/link";

const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="py-6 px-6 md:px-12 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/"}>
          <div className="font-bold text-xl">ResumeToFolio</div>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            {/* Changed to Link component for consistency */}
            <Link
              href="#how-it-works"
              className="text-md font-medium hover:text-primary/80 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/gen"
              className="text-md font-medium hover:text-primary/80 transition-colors"
            >
              Generate
            </Link>
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
