import { Github, ExternalLink } from "lucide-react";
import SkillTag from "./SkillTag";

interface ProjectCardProps {
  title: string;
  description: string;
  period: string | null;
  tags: string[];
  githubLink?: string;
  liveLink?: string;
}

const ProjectCard = ({
  title,
  description,
  period,
  tags,
  githubLink,
  liveLink,
}: ProjectCardProps) => {
  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        {period && <span className="text-muted-foreground text-sm">{period}</span>}
      </div>
      
      <p className="text-sm mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <SkillTag key={index} name={tag} />
        ))}
      </div>
      
      <div className="flex gap-4">
        {githubLink && (
          <a 
            href={githubLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Github className="w-4 h-4 mr-1" />
            GitHub
          </a>
        )}
        
        {liveLink && (
          <a 
            href={liveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
