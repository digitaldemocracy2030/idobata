import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const links = [
    { to: "/", label: "ダッシュボード", exact: true },
    { to: "/themes", label: "テーマ管理", exact: false },
    { to: "/siteConfig/edit", label: "サイト設定", exact: true },
  ];

  return (
    <aside className="w-64 bg-background shadow-sm h-full">
      <nav className="mt-5 px-2">
        <ul>
          {links.map((link) => (
            <li key={link.to} className="mb-2">
              <NavLink
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
