import { Home } from "lucide-react";
import { Link } from "../../contexts/MockContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbViewProps {
  items: BreadcrumbItem[];
  homeHref?: string;
}

export function BreadcrumbView({ items, homeHref = "/" }: BreadcrumbViewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isDesktop) {
    return null;
  }

  return (
    <nav className="text-left py-2" aria-label="Breadcrumb">
      <div className="inline text-[10px] leading-[1.5] tracking-[0.03em]">
        {/* ホームアイコン + "トップ" */}
        <Link
          to={homeHref}
          className="inline-flex items-baseline gap-1 text-secondary-500 hover:text-secondary-600 transition-colors no-underline"
        >
          <Home
            size={12}
            strokeWidth={1}
            className="inline-block translate-y-0.5"
          />
          <span>トップ</span>
        </Link>

        {/* パンくずリスト */}
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`}>
            <span className="text-secondary-500 mx-1"> {">"} </span>
            <Link
              to={item.href}
              className="text-secondary-500 no-underline hover:text-secondary-600 transition-colors"
            >
              {item.label}
            </Link>
          </span>
        ))}
      </div>
    </nav>
  );
}

export default BreadcrumbView;
