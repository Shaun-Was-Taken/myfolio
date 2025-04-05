import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CertificationCardProps {
  title: string;
  description: string;
}

const CertificationCard = ({
  title,
  description,
}: CertificationCardProps) => {
  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default CertificationCard;