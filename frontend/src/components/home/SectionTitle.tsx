import React from 'react';

interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <h2 className="text-2xl font-bold text-neutral-900 mb-6">{title}</h2>
  );
};

export default SectionTitle;
