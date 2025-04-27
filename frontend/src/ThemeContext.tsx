import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from './types';

interface ThemeContextType {
  defaultThemeId: string | null;
  isLoading: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextType>({
  defaultThemeId: null,
  isLoading: false,
  error: null,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children?: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [defaultThemeId, setDefaultThemeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultTheme = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/themes`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const themes = await response.json();
        if (themes && themes.length > 0) {
          const defaultTheme = themes.find((theme: Theme) => theme.slug === 'default') || themes[0];
          setDefaultThemeId(defaultTheme._id);
          localStorage.setItem('defaultThemeId', defaultTheme._id);
        } else {
          throw new Error('No themes available');
        }
      } catch (error: any) {
        console.error('Failed to fetch default theme:', error);
        const cachedThemeId = localStorage.getItem('defaultThemeId');
        if (cachedThemeId) {
          setDefaultThemeId(cachedThemeId);
          setError(null);
        } else {
          setError('テーマの取得に失敗しました。しばらく経ってからリロードしてください。');
        }
      } finally {
        setIsLoading(false);
      }
    };

    const cachedThemeId = localStorage.getItem('defaultThemeId');
    if (cachedThemeId) {
      setDefaultThemeId(cachedThemeId);
      setIsLoading(false);
    } else {
      fetchDefaultTheme();
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ defaultThemeId, isLoading, error }}>
      {children}
    </ThemeContext.Provider>
  );
};
