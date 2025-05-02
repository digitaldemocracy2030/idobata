interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <div className="flex items-center py-2 mb-3">
      <div className="w-1 h-6 bg-purple-500 rounded-full mr-2" />
      <h2 className="text-xl font-bold text-neutral-900 font-biz">{title}</h2>
    </div>
  );
};

export default SectionTitle;
