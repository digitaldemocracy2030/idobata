import { useState, useEffect, useRef } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainPage from './pages/MainPage';
import DataPage from './pages/DataPage';
import Top from './pages/Top';
import About from './pages/About';
import Themes from './pages/Themes';
import ThemeDetail from './pages/ThemeDetail';
import AppLayout from './components/AppLayout';
import PageLayout from './components/layout/PageLayout';
import { ThemeProvider } from './ThemeContext';
import { FloatingChat, FloatingChatRef } from './components/chat/FloatingChat';

function App() {
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem('policyChatUserId') || null
  );
  const chatRef = useRef<FloatingChatRef>(null);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('policyChatUserId', userId);
    } else {
      // Optional: Clear localStorage if userId becomes null (e.g., on logout)
      // localStorage.removeItem('policyChatUserId');
    }
  }, [userId]);

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    
    setTimeout(() => {
      chatRef.current?.addMessage('メッセージを受け取りました。', 'system');
    }, 500);
  };

  return (
    <>
      <Outlet context={{ userId, setUserId }} />
      <FloatingChat ref={chatRef} onSendMessage={handleSendMessage} />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ThemeProvider>
        <App />
      </ThemeProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/top" replace /> },
      {
        path: 'legacy',
        element: <AppLayout />,
        children: [
          { index: true, element: <MainPage /> },
          { path: 'data', element: <DataPage /> },
          { path: '*', element: <Navigate to="/old" replace /> },
        ],
      },
      {
        path: 'top',
        element: (
          <PageLayout>
            <Top />
          </PageLayout>
        ),
      },
      {
        path: 'about',
        element: (
          <PageLayout>
            <About />
          </PageLayout>
        ),
      },
      {
        path: 'themes',
        element: (
          <PageLayout>
            <Themes />
          </PageLayout>
        ),
      },
      {
        path: 'themes/:themeId',
        element: (
          <PageLayout>
            <ThemeDetail />
          </PageLayout>
        ),
      },
    ],
  },
]);

export default App;
