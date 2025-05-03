import * as React from "react";
import { cn } from "../../lib/utils";
import SectionHeading from "../common/SectionHeading";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <section ref={ref} className={cn("rounded-lg p-6", className)} {...props}>
        {title && <SectionHeading title={title} />}
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
