import React from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbViewProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbView({ items }: BreadcrumbViewProps) {
  return (
    <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={index}>
          <a href={item.href} className="underline">
            {item.label}
          </a>
          {index < items.length - 1 && " ＞ "}
        </span>
      ))}
    </nav>
  );
}

export default BreadcrumbView;
