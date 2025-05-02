import { cn } from "../../lib/utils";

interface SectionHeadingProps {
  title: string;
  className?: string;
}

export function SectionHeading({ title, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-start py-2 mb-3", className)}>
      <div className="w-1 h-6 bg-primary rounded-full mr-2" />
      <h2 className="text-xl font-bold text-foreground font-biz">{title}</h2>
    </div>
  );
}

export default SectionHeading;
