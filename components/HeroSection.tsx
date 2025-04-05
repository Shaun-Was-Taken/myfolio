import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-10 md:py-24 px-6 md:px-12">
      <div className="container mx-auto max-w-4xl text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Create a Professional Portfolio ✨
          <br />
          With Just <span className="text-primary">One Click</span> 🚀
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Transform your resume into a stunning portfolio website in seconds. No
          design skills needed. 🎨
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-lg font-medium group hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
