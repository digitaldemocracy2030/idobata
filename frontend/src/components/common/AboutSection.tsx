import type React from "react";

interface AboutSectionProps {
  title: string;
  body: React.ReactNode;
}

export function AboutSection({ title, body }: AboutSectionProps) {
  return (
    <section className="py-8">
      <div className="flex items-center py-2 mb-3">
        <div className="w-1 h-6 bg-primary rounded-full mr-2" />
        <h2 className="text-xl font-bold text-foreground font-biz">{title}</h2>
      </div>
      <div className="space-y-4">{body}</div>
    </section>
  );
}

export default AboutSection;
