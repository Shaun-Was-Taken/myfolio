import { Badge } from "@/components/ui/badge";
interface SkillTagProps {
    name: string;
  }
  
  const SkillTag = ({ name }: SkillTagProps) => {
    return<Badge variant="default" className="text-sm font-medium m-1 px-3 py-.5">{name}</Badge>;
  };
  
  export default SkillTag;
  