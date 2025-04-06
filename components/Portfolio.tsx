"use client";
import SkillTag from "@/components/SkillTag";
import ExperienceCard from "@/components/ExperienceCard";
import EducationCard from "@/components/EducationCard";
import ProjectCard from "@/components/ProjectCard";
import ContactSection from "@/components/ContactSection";
import CertificationCard from "@/components/CertificationCard";


import {
  Accordion,
} from "@/components/ui/accordion";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PortfolioProps {
  portfolioData: any;
  isPreview?: boolean;
}

const Portfolio = ({ portfolioData, isPreview }: PortfolioProps) => {
  const { isLoaded } = useUser();

  // Show loading state while loading data
  if (!isLoaded || portfolioData === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <main
        className={`w-full md:${isPreview ? "w-[70%]" : "w-[50%]"} lg:${isPreview ? "w-[70%]" : "w-[50%]"} max-w-7xl px-4 sm:px-6`}
      >
        {/* Hero Section */}
        <section className="py-10 md:py-20">
          <div className="container mx-auto px-0 sm:px-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">
              <div className="text-center md:text-left order-2 md:order-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center md:justify-start">
                  Hi, I'm {portfolioData.name} 👋
                </h1>
                <p className="text-lg md:text-xl mb-4 flex gap-5 mt-2 justify-center md:justify-start">
                  {portfolioData.title}{" "}
                </p>
                <p className="text-muted-foreground">
                  {portfolioData.description}
                </p>
              </div>
              <div className="flex justify-center md:justify-end order-1 md:order-2 mb-6 md:mb-0">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 lg:h-40 lg:w-40">
                  <AvatarImage src={portfolioData.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2">About</h2>
            <div className="prose max-w-none">
              {portfolioData.about.map((paragraph: string, index: any) => (
                <p
                  key={index}
                  className={
                    index < portfolioData.about.length - 1 ? "mb-4" : ""
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        {portfolioData.experience.length > 0 && (
          <section id="experience" className="pb-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 border-b pb-2">
                Work Experience
              </h2>

              <Accordion type="single" collapsible className="w-full">
                {portfolioData.experience.map((exp: any, index: any) => (
                  <ExperienceCard
                    key={index}
                    title={exp.title}
                    company={exp.company}
                    period={exp.period}
                    location={exp.location}
                    descriptions={exp.description}
                    logo={exp.companyLogo}
                    value={`experience-${index}`}
                  />
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Education Section */}
        {portfolioData.education.length > 0 && (
          <section id="education" className="pb-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 border-b pb-2">
                Education
              </h2>

              <Accordion type="single" collapsible className="w-full">
                {portfolioData.education.map((edu: any, index: any) => (
                  <EducationCard
                    key={index}
                    school={edu.school}
                    degree={edu.degree}
                    period={edu.period || null}
                    logo={edu.logo || undefined}
                    courses={edu.courses?.join(", ")}
                    activities={edu.activities}
                    honors={edu.honors}
                    gpa={edu.gpa}
                    value={`education-${index}`}
                  />
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {portfolioData.skills.length > 0 && (
          <section id="skills" className="pb-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 border-b pb-2">Skills</h2>

              {portfolioData.skills.length > 0 && (
                <div className="mb-6">
                  <div>
                    {portfolioData.skills.map((skill: any, index: any) => (
                      <SkillTag key={index} name={skill} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {portfolioData.projects.length > 0 && (
          <section id="projects" className="pb-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 border-b pb-2">
                My Projects
              </h2>
              <p className="mb-8">
                Here are some of my notable projects that highlight my technical
                skills and interests.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.projects.map((project: any, index: any) => (
                  <ProjectCard
                    key={index}
                    title={project.title}
                    description={project.description}
                    period={project.period}
                    tags={project.tags}
                    githubLink={project.githubLink || undefined}
                    liveLink={project.liveLink || undefined}
                    image={project.projectPicture || undefined}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {portfolioData.certifications.length > 0 && (
          <section className="pb-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 border-b pb-2">
                Certifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.certifications.map((cert: any, index: any) => (
                  <CertificationCard
                    key={index}
                    title={(cert as any).title}
                    description={(cert as any).description}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Activities & Interests */}
        {portfolioData.activities.campusInvolvement.length > 0 &&
          portfolioData.activities.campusInvolvement.length > 0 && (
            <section className="pb-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-6 border-b pb-2">
                  Activities & Interests
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioData.activities.campusInvolvement.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        Campus Involvement
                      </h3>
                      <ul className="list-disc pl-5">
                        {portfolioData.activities.campusInvolvement.map(
                          (activity: any, index: any) => (
                            <li key={index}>{activity}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {portfolioData.activities.areasOfInterest.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        Areas of Interest
                      </h3>
                      <ul className="list-disc pl-5">
                        {portfolioData.activities.areasOfInterest.map(
                          (interest: any, index: any) => (
                            <li key={index}>{interest}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

        {/* Contact Section */}
        <ContactSection
          email={portfolioData.contact.email}
          phone={portfolioData.contact.phone}
          location={portfolioData.contact.location}
          linkedin={undefined}
        />
      </main>
    </div>
  );
};

export default Portfolio;
