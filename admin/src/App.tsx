import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MainContent from "./components/layout/MainContent";
import Dashboard from "./pages/Dashboard";
import ThemeList from "./pages/ThemeList";
import ThemeCreate from "./pages/ThemeCreate";
import ThemeEdit from "./pages/ThemeEdit";

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/themes" element={<ThemeList />} />
              <Route path="/themes/new" element={<ThemeCreate />} />
              <Route path="/themes/:themeId" element={<ThemeEdit />} />
            </Routes>
          </MainContent>
        </div>
      </div>
    </Router>
  );
};

export default App;
