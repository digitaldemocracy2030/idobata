import { cn } from "../../lib/utils";

interface SectionTitleProps {
  title: string;
  className?: string;
}

const SectionTitle = ({ title, className }: SectionTitleProps) => {
  return (
    <div className={cn("flex items-center py-2 mb-3", className)}>
      <div className="w-1 h-6 bg-primary rounded-full mr-2" />
      <h2 className="text-xl font-bold text-foreground font-biz">{title}</h2>
    </div>
  );
};

export default SectionTitle;
