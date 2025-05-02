import type React from "react";
import SectionHeading from "./SectionHeading";

interface AboutSectionProps {
  title: string;
  body: React.ReactNode;
}

export function AboutSection({ title, body }: AboutSectionProps) {
  return (
    <section className="py-8">
      <SectionHeading title={title} />
      <div className="space-y-4">{body}</div>
    </section>
  );
}

export default AboutSection;
