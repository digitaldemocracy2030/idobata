import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Header: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-foreground">
          <Link to="/">いどばた管理画面</Link>
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;
