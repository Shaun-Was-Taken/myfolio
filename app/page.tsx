import HeroSection from "@/components/HeroSection";
import ProcessSteps from "@/components/ProcessSteps";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="flex flex-col">
        <HeroSection />
        <ProcessSteps />
      </main>
    </div>
  );
}
