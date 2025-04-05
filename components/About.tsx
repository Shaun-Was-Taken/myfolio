import React from "react";
import { Button } from "@/components/ui/button";
import { Hand } from "lucide-react";

const AboutMe = () => {
  return (
    <div className="container mx-auto max-w-5xl px-4">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center">
                  Hi, I'm Abdulaziz <Hand className="ml-2 w-8 h-8 text-amber-400" />
                </h1>
                <p className="text-lg md:text-xl mb-4">
                  CS student at KU, aspiring software engineer.
                </p>
                <p className="text-muted-foreground max-w-2xl">
                  Passionate about coding, AI research, and staying current with tech trends.
                </p>
              </div>
            </div>
          </div>
  );
};

export default AboutMe;