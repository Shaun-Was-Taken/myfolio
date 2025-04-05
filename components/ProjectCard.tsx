import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, ExternalLink } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";

interface ProjectCardProps {
  title: string;
  description: string;
  period: string | null;
  tags: string[];
  githubLink?: string;
  liveLink?: string;
  image?: string;
}

const ProjectCard = ({
  title,
  description,
  period,
  tags,
  githubLink,
  liveLink,
  image,
}: ProjectCardProps) => {
  return (
    <Card className="flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full">
      {image ? (
        <div className="w-full h-55 overflow-hidden">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">
            {title
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </span>
        </div>
      )}
      <CardHeader className="px-2">
        <div className="">
          <div className="flex justify-between items-center">
            <CardTitle className=" text-lg font-bold">{title}</CardTitle>
            {period && <time className="font-sans text-xs">{period}</time>}
          </div>
          <Markdown
            components={{
              p: ({ children }) => (
                <p className="prose max-w-full mt-4 text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-foreground">
                  {children}
                </strong>
              ),
            }}
          >
            {description}
          </Markdown>
        </div>
      </CardHeader>
      <CardContent className="py-1 flex flex-col px-2 pb-0 mb-0">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge
                className="px-2 py-1 text-xs font-bold"
                variant="secondary"
                key={tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-2 pt-0 pb-2 mt-0">
        <div className="flex flex-row flex-wrap items-start gap-1">
          {githubLink && (
            <Link href={githubLink} target="_blank">
              <Badge className="flex gap- px-2 py-1 text-[10px]">
                <Github className="w-3 h-3" />
                GitHub
              </Badge>
            </Link>
          )}
          {liveLink && (
            <Link href={liveLink} target="_blank">
              <Badge className="flex gap-2 px-2 py-1 text-[10px]">
                <ExternalLink className="w-3 h-3" />
                Live Demo
              </Badge>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
