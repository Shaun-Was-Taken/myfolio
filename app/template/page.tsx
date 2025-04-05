"use client"
import NavBar from "@/components/Header";
import {Avatar} from "@/components/ui/avatar";
import SkillTag from "@/components/SkillTag";
import ExperienceCard from "@/components/ExperienceCard";
import EducationCard from "@/components/EducationCard";
import ProjectCard from "@/components/ProjectCard";
import ContactSection from "@/components/ContactSection";
import { Hand, Github, Linkedin, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import CertificationCard from "@/components/CertificationCard";

// Sample portfolio data - replace with your actual data
const portfolioData = {
  name: "Zain Ghosheh",
  title: "Computer Science Graduate | Full-Stack Developer",
  description: "Recent Computer Science graduate with hands-on experience in full-stack development, compiler design, and game development. Skilled in Java, C/C++, React, and Unity.",
  about: ["Passionate developer with a strong foundation in computer science and experience building real-world applications, from web apps to low-level systems. Proven ability to learn and apply new technologies quickly."],
  education: [
    {
      school: "University of Kansas",
      degree: "Bachelor of Science in Computer Science",
      period: null,
      logo: null,
      courses: [],
      activities: [],
      honors: [],
      gpa: null
    },
    {
      school: "Johnson County Community College",
      degree: "Associate’s in Liberal Arts",
      period: null,
      logo: null,
      courses: [],
      activities: [],
      honors: [],
      gpa: null
    }
  ],
  experience: [
    {
      title: "Facility Operations",
      company: "LifeTime",
      period: "Oct. 2022 – Present",
      location: "Leneza, KS",
      descriptions: [
        "Managed equipment maintenance to ensure safety and functionality for members",
        "Assisted customers with inquiries and provided excellent service to enhance the gym experience",
        "Oversaw facility cleanliness and maintenance, ensuring a well-maintained environment"
      ]
    },
    {
      title: "Data Entry",
      company: "Prompt Medical Billing",
      period: "June. 2022 – Present",
      location: "Leneza, KS",
      descriptions: [
        "Accurately entered and processed medical billing data, maintaining high efficiency and precision",
        "Assisted with office services and maintenance to support daily administrative operations"
      ]
    },
    {
      title: "Sales Member",
      company: "Advance Auto Parts",
      period: "Nov. 2020 – May 2022",
      location: "Leneza, KS",
      descriptions: [
        "Provided excellent customer service by assisting clients in finding automotive parts and solutions",
        "Managed and sourced business client needs, ensuring timely order fulfillment",
        "Delivered parts to business clients and performed occasional mechanical work"
      ]
    }
  ],
  projects: [
    {
      title: "Yap",
      description: "A real-time web app enabling instant video and text chats using WebRTC and Socket.IO.",
      period: "Jan. 2025",
      tags: ["React Native", "Java Spring Boot", "PostgreSQL"],
      githubLink: null,
      liveLink: null
    },
    {
      title: "A Compiler",
      description: "Designed and implemented a compiler for a custom programming language, including lexical analysis, parsing, and code generation.",
      period: "Aug. 2024 – Dec. 2024",
      tags: ["C++", "Git"],
      githubLink: null,
      liveLink: null
    },
    {
      title: "Way of the Runner",
      description: "A 2D endless runner game using Unity and C#, implementing dynamic obstacles and power-ups.",
      period: "Aug. 2024 – Dec. 2024",
      tags: ["Unity", "C#", "Git"],
      githubLink: null,
      liveLink: null
    },
    {
      title: "Quash",
      description: "A custom Unix shell with built-in command execution and process management.",
      period: "May 2024",
      tags: ["C", "Bash", "Git"],
      githubLink: null,
      liveLink: null
    },

  ],
  certifications: [],
  skills: [
    "Java",
    "Python",
    "C/C++",
    "JavaScript",
    "HTML/CSS",
    "SQL",
    "React",
    "Node.js",
    "Unity Engine",
    "Flex",
    "Bison",
    "Linux",
    "Git",
    "VS Code",
    "Visual Studio",
    "PyCharm",
    "IntelliJ",
    "Eclipse"
  ],
  activities: {
    campusInvolvement: [],
    areasOfInterest: []
  },
  contact: {
    email: "zainghosheh1@gmail.com",
    phone: "913-602-0859",
    location: "Leneza, KS" // Extracted from work experience locations
  },
};

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <main className="w-[40%] max-w-7xl">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center">
                  Hi, I'm {portfolioData.name} <Hand className="ml-2 w-8 h-8 text-amber-400" />
                </h1>
                <p className="text-lg md:text-xl mb-4">
                  {portfolioData.title}
                </p>
                <p className="text-muted-foreground">
                  {portfolioData.description}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2">About</h2>
            <div className="prose max-w-none">
              {portfolioData.about.map((paragraph, index) => (
                <p key={index} className={index < portfolioData.about.length - 1 ? "mb-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
        
        {/* Experience Section */}
        { portfolioData.experience.length >0 && (<section id="experience" className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2">Work Experience</h2>
            
            <Accordion type="single" collapsible className="w-full">
              {portfolioData.experience.map((exp, index) => (
                <ExperienceCard
                  key={index}
                  title={exp.title}
                  company={exp.company}
                  period={exp.period}
                  location={exp.location}
                  descriptions={exp.descriptions}
                  logo={undefined}
                  value={`experience-${index}`}
                />
              ))}
            </Accordion>
          </div>
        </section>)}
        
        {/* Education Section */}
        { portfolioData.education.length >0 && (<section id="education" className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2">Education</h2>
            
            <Accordion type="single" collapsible className="w-full">
              {portfolioData.education.map((edu, index) => (
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
        </section>)}
        
        {/* Skills Section */}
        { portfolioData.skills.length >0 && (<section id="skills" className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2">Skills</h2>
            
            {portfolioData.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Programming Languages</h3>
                <div>
                  {portfolioData.skills.map((skill, index) => (
                    <SkillTag key={index} name={skill} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>)}
        
        {/* Projects Section */}
       { portfolioData.projects.length >0 && (<section id="projects" className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2">My Projects</h2>
            <p className="mb-8">
              Here are some of my notable projects that highlight my technical skills and interests.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolioData.projects.map((project, index) => (
                <ProjectCard
                  key={index}
                  title={project.title}
                  description={project.description}
                  period={project.period}
                  tags={project.tags}
                  githubLink={project.githubLink || undefined}
                  liveLink={project.liveLink || undefined}
                />
              ))}
            </div>
          </div>
        </section>)}
        
        {/* Certifications Section */}
        {portfolioData.certifications.length > 0 && (
          <section className="pb-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6 border-b pb-2">Certifications</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.certifications.map((cert, index) => (
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
        {portfolioData.activities.campusInvolvement.length > 0 &&portfolioData.activities.campusInvolvement.length > 0  && (<section className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2">Activities & Interests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolioData.activities.campusInvolvement.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Campus Involvement</h3>
                  <ul className="list-disc pl-5">
                    {portfolioData.activities.campusInvolvement.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {portfolioData.activities.areasOfInterest.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Areas of Interest</h3>
                  <ul className="list-disc pl-5">
                    {portfolioData.activities.areasOfInterest.map((interest, index) => (
                      <li key={index}>{interest}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section> )}
        
        
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

export default Index;
