import React from "react";

const Footer = () => {
  return (
    <footer className="py-8 px-6 md:px-12 border-t">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ResumeToFolio. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
