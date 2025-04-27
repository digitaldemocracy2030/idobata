import { useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainPage from './pages/MainPage';
import DataPage from './pages/DataPage';
import Top from './pages/Top';
import About from './pages/About';
import AppLayout from './components/AppLayout';

function App() {
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem('policyChatUserId') || null
  );

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
      {
        path: 'top',
        element: <Top />,
      },
      {
        path: 'about',
        element: <About />,
      },
    ],
  },
]);

export default App;
