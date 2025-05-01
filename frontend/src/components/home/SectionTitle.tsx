interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <div className="flex items-center py-2 border-l-4 border-purple-500 pl-3 mb-3">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
    </div>
  );
};

export default SectionTitle;
