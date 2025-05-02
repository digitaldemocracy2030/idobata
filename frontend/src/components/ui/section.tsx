import * as React from "react";
import { cn } from "../../lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <section ref={ref} className={cn("rounded-lg p-6", className)} {...props}>
        {title && (
          <div className="flex items-center py-2 mb-3">
            <div className="w-1 h-6 bg-primary rounded-full mr-2" />
            <h2 className="text-xl font-bold text-foreground font-biz">
              {title}
            </h2>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
        )}
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
