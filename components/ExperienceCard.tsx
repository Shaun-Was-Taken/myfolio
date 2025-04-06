import { Calendar } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ExperienceCardProps {
  title: string;
  company: string;
  period: string;
  location: string;
  descriptions: string[];
  logo?: string;
  value: string;
}

const ExperienceCard = ({
  title,
  company,
  period,
  location,
  descriptions,
  logo,
  value,
}: ExperienceCardProps) => {
  return (
    <AccordionItem value={value} className="border-b py-3">
      <AccordionTrigger className="hover:bg-gray-50 rounded-md py-2">
        <div className="flex items-start gap-4 w-full">
          <div className="hidden md:flex min-w-[48px] h-12 w-12 rounded-md bg-secondary items-center justify-center">
            {logo ? (
              <img src={logo} alt={company} className="w-8 h-8" />
            ) : (
              <span className="flex items-center justify-center w-full h-full font-bold">
                {company.charAt(0)}
              </span>
            )}
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-lg">
              {title} | {company}
            </h3>
            <p className="text-muted-foreground text-sm">{period} </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-2 mt-2 ml-16">
          <ul className="list-disc pl-4 space-y-1">
            {descriptions.map((description, index) => (
              <li key={index} className="text-sm md:text-base">
                {description}
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ExperienceCard;
