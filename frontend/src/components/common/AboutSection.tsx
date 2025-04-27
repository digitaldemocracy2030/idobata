import React from 'react';

interface AboutSectionProps {
  title: string;
  body: React.ReactNode;
}

export function AboutSection({ title, body }: AboutSectionProps) {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="space-y-4">{body}</div>
    </section>
  );
}

export default AboutSection;
