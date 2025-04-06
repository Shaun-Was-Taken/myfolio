import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-10 md:py-16 lg:py-24 px-4 sm:px-6 md:px-12">
      <div className="container mx-auto max-w-4xl text-center animate-fade-in">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
          Create a Professional Portfolio{" "}
          <span className="inline-block">✨</span>
          <br className="sm:hidden" />
          <br className="hidden sm:block" />
          With Just{" "}
          <span className="text-primary">
            One Click <span className="inline-block">🚀</span>
          </span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-xs sm:max-w-lg md:max-w-2xl mx-auto mb-6 md:mb-10 px-2">
          Transform your resume into a stunning portfolio website in seconds. No
          design skills needed. 🎨
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-medium group hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
