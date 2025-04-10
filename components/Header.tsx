"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import CustomProfile from "./CustomProfile";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { isSignedIn } = useAuth();
  const hasGenerated = useQuery(api.user.hasGeneratedPortfolio);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="py-6 px-6 md:px-12 w-full relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/"} className="flex">
          <div className="font-bold text-xl">ResumeToFolio</div>
        </Link>
        <div className="flex items-center gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#how-it-works"
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Authentication Button/Profile */}
          <div className="hidden md:block">
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
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background z-50 border-b border-border shadow-lg">
          <div className="container mx-auto py-4 px-6">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#how-it-works"
                className="text-lg font-medium hover:text-primary/80 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {isSignedIn && hasGenerated !== true && (
                <Link
                  href="/gen"
                  className="text-lg font-medium hover:text-primary/80 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Generate
                </Link>
              )}
              {isSignedIn && hasGenerated === true && (
                <Link
                  href="/preview"
                  className="text-lg font-medium hover:text-primary/80 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Portfolio
                </Link>
              )}
              <div className="pt-2">
                {isSignedIn ? (
                  <CustomProfile />
                ) : (
                  <SignInButton mode="modal">
                    <Button
                      variant="default"
                      size="lg"
                      className="rounded-full w-full"
                    >
                      Login
                    </Button>
                  </SignInButton>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
