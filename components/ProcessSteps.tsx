import React from "react";
import { FileText, PenTool, Globe, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Upload Resume",
    description: "Upload your existing resume in PDF or DOCX format.",
  },
  {
    icon: PenTool,
    title: "AI Processing",
    description:
      "Our AI analyzes your resume and extracts all relevant information.",
  },
  {
    icon: Globe,
    title: "Portfolio Generation",
    description:
      "A beautiful portfolio website is automatically created based on your skills and experience.",
  },
  {
    icon: CheckCircle,
    title: "Ready to Share",
    description:
      "Share your professional portfolio with potential employers or clients.",
  },
];

const ProcessSteps = () => {
  return (
    <section className="py-5 px-6 md:px-12" id="how-it-works">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our platform makes it easy to transform your resume into a
            professional portfolio in just four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 w-8 h-0.5 bg-border -translate-y-1/2 translate-x-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
