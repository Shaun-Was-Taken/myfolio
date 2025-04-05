import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar } from "@/components/ui/avatar";

interface EducationCardProps {
  school: string;
  degree: string;
  period: string | null;
  logo?: string;
  courses?: string;
  activities?: string[];
  honors?: string[];
  gpa?: string | null;
  value: string;
}

const EducationCard = ({
  school,
  degree,
  period,
  logo,
  courses,
  activities,
  honors,
  gpa,
  value,
}: EducationCardProps) => {
  return (
    <AccordionItem value={value} className="border-b pb-3">
      <AccordionTrigger className="hover:bg-gray-50 rounded-md py-2">
        <div className="flex items-center text-left w-full">
          {logo ? (
            <Avatar className="h-10 w-10 mr-3">
              <img src={logo} alt={school} />
            </Avatar>
          ): (  <span className="hidden md:flex min-w-[48px] h-12 w-12 rounded-md bg-secondary items-center justify-center mr-3">{school.charAt(0)}</span>)}
          
          <div>
            <h3 className="font-bold text-lg">{school}</h3>
            <p className="text-muted-foreground">{degree}</p>
            {period && <p className="text-sm text-muted-foreground">{period}</p>}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-2 mt-2">
          {gpa && (
            <p className="mb-2">
              <span className="font-semibold">GPA:</span> {gpa}
            </p>
          )}
          
          {courses && (
            <div className="mb-2">
              <p className="font-semibold">Relevant Coursework:</p>
              <p className="text-sm">{courses}</p>
            </div>
          )}
          
          {activities && activities.length > 0 && (
            <div className="mb-2">
              <p className="font-semibold">Activities:</p>
              <ul className="list-disc pl-5 text-sm">
                {activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          )}
          
          {honors && honors.length > 0 && (
            <div>
              <p className="font-semibold">Honors & Awards:</p>
              <ul className="list-disc pl-5 text-sm">
                {honors.map((honor, index) => (
                  <li key={index}>{honor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EducationCard;
  