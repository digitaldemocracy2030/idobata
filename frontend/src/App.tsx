import React, { useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainPage from './pages/MainPage';
import DataPage from './pages/DataPage';
import AppLayout from './components/AppLayout';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('policyChatUserId') || null);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('policyChatUserId', userId);
    } else {
      // Optional: Clear localStorage if userId becomes null (e.g., on logout)
      // localStorage.removeItem('policyChatUserId');
    }
  }, [userId]);

  return <Outlet context={{ userId, setUserId }} />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <MainPage /> },
          { path: 'data', element: <DataPage /> },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

export default App;
